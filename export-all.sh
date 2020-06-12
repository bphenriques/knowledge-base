#!/bin/sh
set -e

ORG_SOURCE_FILES=$1
find ${ORG_SOURCE_FILES} -type f -name '*.org' | while read file; do
   echo "> Exporting '$file' .."
   emacs --batch "$file" --load=$(pwd)/build.el --execute "(build/export-all)" --kill
done
