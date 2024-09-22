#!/bin/bash

for file in *.js; do
  if [ -f "$file" ]; then
    node "$file"
  fi
done
