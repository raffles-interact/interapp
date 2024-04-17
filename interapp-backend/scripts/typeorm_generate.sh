#!/bin/bash

# Generate migration

if [ -z "$1" ]
then
  echo "Please provide a name for the migration"
  exit 1
fi
bun run typeorm migration:generate db/migrations/$1 -d db/data_source.ts 

