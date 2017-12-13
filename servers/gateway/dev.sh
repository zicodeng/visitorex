#!/usr/bin/env bash

set -e

export SERVER_ADDR=localhost:443

export TLS_CERT="$(pwd)/tls/fullchain.pem"
export TLS_KEY="$(pwd)/tls/privkey.pem"
export SESSION_KEY="hello world"

export REDIS_ADDR=192.168.99.100:6379

export REDIS_CONTAINER=redis-server

if [ "$(docker ps -aq --filter name=$REDIS_CONTAINER)" ]; then
    docker rm -f $REDIS_CONTAINER
fi

# Run Redis Docker container.
docker run \
-d \
--name $REDIS_CONTAINER \
-p 6379:6379 \
redis

go run main.go