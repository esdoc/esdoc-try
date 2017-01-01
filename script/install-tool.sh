#!/bin/bash

mkdir -p www/codemirror/lib
mkdir -p www/codemirror/mode
cp -a ./node_modules/codemirror/lib/* www/codemirror/lib/
cp -a ./node_modules/codemirror/mode/javascript www/codemirror/mode/
cp -a ./node_modules/codemirror/mode/markdown www/codemirror/mode/

mkdir -p www/babylon
cp -a ./node_modules/babylon/lib www/babylon/
