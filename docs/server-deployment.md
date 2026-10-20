# Server deployment

The user authorized deploying every system update to `23.94.177.10` as SSH user `foundry` on 2026-10-17. This is separate from GitHub release publishing.

After checks and release packaging, run `tools/deploy.py` using Python with Paramiko installed. It prompts for the SSH password; no password is saved in the project. The first connection records the host key in the local SSH known-hosts file; subsequent connections check it.

The helper uploads the ZIP under `/exd/`, verifies SHA-256, and stages its contents before stopping PM2 process 0. It moves the previous system folder to `/exd/foundrydata/system-backups/`, then installs the complete replacement at `/exd/foundrydata/Data/systems/10kswordsfoundry/`. Whole-folder replacement prevents stale LevelDB files from mixing with new compendium data.

It then runs `sh /exd/updatepush.sh`. The server-maintained script restarts Foundry, waits 120 seconds, and posts its configured Discord notification. The helper checks that PM2 process 0 is online and that the installed manifest has the intended version before deleting the uploaded ZIP. Local release assets and the server backup remain available.

If a step fails, inspect the reported state before retrying. The ZIP is retained on failure. Backups are not automatically deleted. A failed update script or health check requires investigating the service and, when appropriate, restoring the saved system directory before restarting Foundry.

Do not copy passwords or the server script's webhook credential into documentation or logs. Deployment does not authorize Git operations or GitHub publishing.
