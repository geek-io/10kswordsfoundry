#!/bin/sh
# Compile the 2.1 compendiums from the installed system's data/*-21.json catalogs.
# Lives on the server at /home/foundry/swords-build/build-21.sh, with
# /home/foundry/swords-build/tools/{build-packs.mjs,check-pack-effects.mjs} copied from tools/.
# Usage: sh build-21.sh            -> build into /home/foundry/swords-build/packs (staging) and verify
#        sh build-21.sh --install  -> also replace the installed 2.1 packs (run updatepush.sh afterwards)
set -e
SYS=/exd/foundrydata/Data/systems/10kswordsfoundry
STAGE=/home/foundry/swords-build/packs
cd "$SYS"
PACKS=$(node -e 'console.log(require("./system.json").packs.map(p=>p.name).filter(n=>n.endsWith("-21")).join(" "))')
rm -rf "$STAGE"; mkdir -p "$STAGE"
FOUNDRY_APP=/home/foundry/foundryvtt PACK_ROOT="$STAGE" node /home/foundry/swords-build/tools/build-packs.mjs $PACKS
if [ "$1" = "--install" ]; then
  for p in $PACKS; do
    rm -rf "$SYS/packs/$p"
    mkdir -p "$SYS/packs/$p"
    find "$STAGE/$p" -maxdepth 1 -type f ! -name LOCK ! -name 'LOG*' -exec cp {} "$SYS/packs/$p/" \;
  done
  echo "Installed: $PACKS"
fi
