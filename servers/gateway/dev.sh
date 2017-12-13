#!/usr/bin/env bash

set -e

export SERVER_ADDR=localhost:443

export TLS_CERT="$(pwd)/tls/fullchain.pem"
export TLS_KEY="$(pwd)/tls/privkey.pem"
export SESSION_KEY="hello world"

export REDIS_ADDR=192.168.99.100:6379
export MONGO_ADDR=192.168.99.100:27017
export MQ_ADDR=192.168.99.100:5672
export DB_NAME="app"

export REDIS_CONTAINER=redis-server
export MONGO_CONTAINER=mongo-server
export MQ_CONTAINER=rabbitmq-server

docker system prune -f

if [ "$(docker ps -aq --filter name=$REDIS_CONTAINER)" ]; then
    docker rm -f $REDIS_CONTAINER
fi

# Run Redis Docker container.
docker run \
-d \
--name $REDIS_CONTAINER \
-p 6379:6379 \
redis

if [ "$(docker ps -aq --filter name=$MONGO_CONTAINER)" ]; then
    docker rm -f $MONGO_CONTAINER
fi

# Run Mongo Docker container.
docker run \
-d \
--name $MONGO_CONTAINER \
-p 27017:27017 \
mongo

if [ "$(docker ps -aq --filter name=$MQ_CONTAINER)" ]; then
    docker rm -f $MQ_CONTAINER
fi

# Run RabbitMQ Docker container.
docker run \
-d \
-p 5672:5672 \
--name $MQ_CONTAINER \
--hostname $MQ_CONTAINER \
rabbitmq

go run main.go
