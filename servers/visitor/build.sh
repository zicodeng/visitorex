#!/usr/bin/env bash

set -e

export VISITOR_CONTAINER=visitorex-visitor-svc

docker build -t zicodeng/$VISITOR_CONTAINER .

if [ "$(docker ps -aq --filter name=$VISITOR_CONTAINER)" ]; then
    docker rm -f $VISITOR_CONTAINER
fi

# Remove dangling images.
if [ "$(docker images -q -f dangling=true)" ]; then
    docker rmi $(docker images -q -f dangling=true)
fi
