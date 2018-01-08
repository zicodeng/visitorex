#!/usr/bin/env bash

set -e

export CILENT_CONTAINER=visitorex-client

echo 'Building source files via Webpack...'
npm run build

echo 'Building Docker container...'
docker build -t zicodeng/$CILENT_CONTAINER .

if [ "$(docker ps -aq --filter name=$CILENT_CONTAINER)" ]; then
    docker rm -f $CILENT_CONTAINER
fi

# Remove dangling images.
if [ "$(docker images -q -f dangling=true)" ]; then
    docker rmi $(docker images -q -f dangling=true)
fi