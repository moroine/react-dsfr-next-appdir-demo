#!/bin/sh
# Remplace la version de @codegouvfr/react-dsfr installée dans node_modules par
# un build local (le dossier dist/ d'un clone de react-dsfr, après
# `npx --yes yarn@1.22.22 install && npx --yes yarn@1.22.22 build`), sans
# toucher à package.json ni à yarn.lock.
#
# Usage : e2e/use-react-dsfr.sh <chemin vers react-dsfr/dist>
#
# Pour revenir à la version publiée : npx --yes yarn@1.22.22 install --force
set -eu

dist="${1:?Usage : e2e/use-react-dsfr.sh <chemin vers react-dsfr/dist>}"
target="$(dirname "$0")/../node_modules/@codegouvfr/react-dsfr"

if [ ! -f "$dist/package.json" ] || [ ! -f "$dist/dsfr/dsfr.module.js" ]; then
    echo "$dist ne ressemble pas à un dist/ de react-dsfr construit" >&2
    exit 1
fi

mkdir -p "$target"
rsync -a --delete "$dist/" "$target/"

# Next garde en cache la version compilée de l'ancien paquet.
rm -rf "$(dirname "$0")/../.next"

echo "@codegouvfr/react-dsfr remplacé par $dist"
