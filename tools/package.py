"""Prepare Foundry release assets locally. Never commits, uploads, or publishes."""
import argparse
import hashlib
import json
from pathlib import Path
from urllib.parse import urlparse
from zipfile import ZipFile, ZIP_DEFLATED

parser = argparse.ArgumentParser()
parser.add_argument('--release', action='store_true', help='Require publishable GitHub manifest/download URLs')
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
manifest_bytes = (root / 'system.json').read_bytes()
manifest = json.loads(manifest_bytes)
filename = f"{manifest['id']}-{manifest['version']}.zip"
if args.release:
    repo = manifest.get('url', '').rstrip('/')
    parsed = urlparse(repo)
    if parsed.scheme != 'https' or parsed.netloc != 'github.com' or len(parsed.path.strip('/').split('/')) != 2:
        raise SystemExit('Set system.json url to the real HTTPS GitHub repository URL.')
    expected = {
        'manifest': f'{repo}/releases/latest/download/system.json',
        'download': f"{repo}/releases/download/v{manifest['version']}/{filename}",
    }
    for key, value in expected.items():
        if manifest.get(key) != value:
            raise SystemExit(f'Update system.json {key} to {value}')
    if manifest['esmodules'] != [f"scripts/entry-{manifest['version']}.mjs"]:
        raise SystemExit('Manifest entry module does not match the release version.')

destination = root / 'dist' / filename
destination.parent.mkdir(exist_ok=True)
files = [root / name for name in ('system.json', 'README.md', 'LICENSE')]
for folder in ('scripts', 'templates', 'styles', 'lang', 'docs', 'assets', 'packs', 'data'):
    files.extend(p for p in (root / folder).rglob('*') if p.is_file()
                 and not (folder == 'packs' and p.name in {'LOCK', 'LOG', 'LOG.old'}))
files.sort(key=lambda p: p.relative_to(root).as_posix())
with ZipFile(destination, 'w', ZIP_DEFLATED) as archive:
    for path in files:
        archive.write(path, f"{manifest['id']}/{path.relative_to(root).as_posix()}")
with ZipFile(destination) as archive:
    assert archive.testzip() is None
    assert archive.read(f"{manifest['id']}/system.json") == manifest_bytes
    names = set(archive.namelist())
    for path in manifest['esmodules'] + manifest['styles'] + [i['path'] for i in manifest['languages']]:
        assert f"{manifest['id']}/{path}" in names, path
    for pack in manifest['packs']:
        assert f"{manifest['id']}/{pack['path']}/CURRENT" in names
    assert all(n.startswith(manifest['id'] + '/') and '..' not in n.split('/') for n in names)
manifest_path = destination.parent / 'system.json'
manifest_path.write_bytes(manifest_bytes)
checksums = destination.parent / 'SHA256SUMS.txt'
checksums.write_text(''.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}\n'
                             for p in [manifest_path, destination]), encoding='utf-8')
print(f'Prepared {destination} ({len(files)} files), system.json, and SHA256SUMS.txt. Nothing uploaded.')
