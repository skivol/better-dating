#!/bin/bash
# https://stackoverflow.com/questions/50291544/postgres10-in-docker-swarm-cluster-database-system-is-shut-down
set -eo pipefail

args=(
   --username "${POSTGRES_USER}"
   --dbname "${POSTGRES_DB}"
   --quiet --no-align --tuples-only
   -c 'SELECT 1'
)

if select=$(psql "${args[@]}") && [ "$select" = '1' ]; then
   exit 0
fi

exit 1
