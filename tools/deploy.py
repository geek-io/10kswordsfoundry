"""Deploy a prepared ZIP to the user's Foundry host. Password is prompted, never saved."""
import argparse, getpass, hashlib, json, shlex, sys, time
from pathlib import Path
import paramiko

parser = argparse.ArgumentParser()
parser.add_argument('--inspect', action='store_true')
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
manifest = json.loads((root/'system.json').read_text(encoding='utf-8'))
archive = root/'dist'/f"10kswordsfoundry-{manifest['version']}.zip"
client = paramiko.SSHClient()
client.load_system_host_keys()
known = Path.home()/'.ssh'/'known_hosts'
known.parent.mkdir(exist_ok=True)
if not known.exists():
    known.touch()
client.load_host_keys(str(known))
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
password = getpass.getpass('Foundry SSH password: ')
client.connect('23.94.177.10', username='foundry', password=password, timeout=20, allow_agent=False, look_for_keys=False)
del password

def run(command):
    _, stdout, stderr = client.exec_command(command, timeout=180)
    output, errors = stdout.read().decode(), stderr.read().decode()
    if output:
        print(output, end='', flush=True)
    if errors:
        print(errors, end='', file=sys.stderr, flush=True)
    status = stdout.channel.recv_exit_status()
    if status:
        raise RuntimeError(f'Remote command failed (exit {status}).')
    return output

try:
    if args.inspect:
        run("id; df -h /exd; ls -ld /exd/foundrydata/Data/systems /exd/foundrydata/Data/systems/10kswordsfoundry; command -v python3; command -v pm2")
    else:
        from zipfile import ZipFile
        with ZipFile(archive) as z:
            assert json.loads(z.read('10kswordsfoundry/system.json')) == manifest
            assert z.testzip() is None
        run('command -v pm2 && test -r /exd/updatepush.sh && test -w /exd/foundrydata/Data/systems')
        stamp = time.strftime('%Y%m%d-%H%M%S', time.gmtime())
        remote = f'/exd/10kswordsfoundry-{manifest["version"]}-{stamp}.zip'
        digest = hashlib.sha256(archive.read_bytes()).hexdigest()
        with client.open_sftp() as sftp:
            sftp.put(str(archive), remote)
        print(f'Uploaded {archive.name}; checking SHA-256.', flush=True)
        run(f'echo {shlex.quote(digest+"  "+remote)} | sha256sum -c -')
        # Stage before stopping Foundry; replace whole packs rather than mixing LevelDB files.
        stage = f'/exd/foundrydata/.10kswords-stage-{stamp}'
        backup = f'/exd/foundrydata/system-backups/10kswordsfoundry-{stamp}'
        target = '/exd/foundrydata/Data/systems/10kswordsfoundry'
        script = f'''
import json, pathlib, zipfile
archive=pathlib.Path({remote!r}); stage=pathlib.Path({stage!r})
stage.mkdir()
with zipfile.ZipFile(archive) as z:
 for name in z.namelist():
  p=pathlib.PurePosixPath(name)
  if p.is_absolute() or '..' in p.parts or p.parts[0]!='10kswordsfoundry': raise ValueError('Unsafe ZIP path')
 z.extractall(stage)
assert json.loads((stage/'10kswordsfoundry/system.json').read_text())['version']=={manifest['version']!r}
print('Staged system version {manifest['version']}.')
'''
        run('python3 -c '+shlex.quote(script))
        run('pm2 stop 0')
        script = f'''
from pathlib import Path
target=Path({target!r}); backup=Path({backup!r}); stage=Path({stage!r})
backup.parent.mkdir(parents=True,exist_ok=True)
if target.exists(): target.rename(backup)
try: (stage/'10kswordsfoundry').rename(target)
except Exception:
 if backup.exists(): backup.rename(target)
 raise
stage.rmdir()
print('Installed system; previous version backed up at '+str(backup))
'''
        try:
            run('python3 -c '+shlex.quote(script))
        except Exception:
            run('pm2 restart 0')
            raise
        print('Running sh /exd/updatepush.sh (includes a 120-second wait).', flush=True)
        run('sh /exd/updatepush.sh')
        run("pm2 jlist | python3 -c "+shlex.quote("import json,sys; p=next(p for p in json.load(sys.stdin) if p['pm_id']==0); print('Foundry PM2 status:',p['pm2_env']['status']); assert p['pm2_env']['status']=='online'"))
        run('python3 -c '+shlex.quote(f"import json,pathlib; p=pathlib.Path({target!r})/'system.json'; v=json.loads(p.read_text())['version']; print('Installed system version:',v); assert v=={manifest['version']!r}; pathlib.Path({remote!r}).unlink(); print('Uploaded ZIP deleted.')"))
finally:
    client.close()
