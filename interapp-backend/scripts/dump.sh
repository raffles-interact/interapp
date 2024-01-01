#!/bin/bash

# Generate dump from postgres container
# Usage: ./dump.sh <dump_name> <host_directory>

if [ -z "$1" ]
then
  echo "Please provide a name for the dump"
  exit 1
fi
if [ -z "$2" ]
then
  echo "Please provide a directory on the host machine to store the dump"
  exit 1
fi

alias exec="docker exec -d interapp-postgres sh -c"
exec "touch /tmp/$1.sql"
exec "PGPASSWORD=postgres pg_dump -U postgres -a interapp > /tmp/$1.sql"

container_id=$(docker ps -aqf "name=interapp-postgres")
docker cp $container_id:/tmp/$1.sql $2/$1.sql

exec "rm /tmp/$1.sql"
exit 0