#!/usr/bin/env bash

set -e

export GATEWAY_CONTAINER=visitorex-api-gateway
export REDIS_CONTAINER=redis-server
export MONGO_CONTAINER=mongo-server
export MQ_CONTAINER=rabbitmq-server

export SERVER_ADDR=:443
export REDIS_ADDR=$REDIS_CONTAINER:6379
export MONGO_ADDR=$MONGO_CONTAINER:27017
export MQ_ADDR=$MQ_CONTAINER:5672

export DB_NAME=app
export APP_NETWORK=appnet
export SESSION_KEY=seeitrun

export TLS_CERT=/etc/letsencrypt/live/visitorex-api.zicodeng.me/fullchain.pem
export TLS_KEY=/etc/letsencrypt/live/visitorex-api.zicodeng.me/privkey.pem

# Make sure to get the latest image.
docker pull zicodeng/$GATEWAY_CONTAINER

# Remove the old containers first.
if [ "$(docker ps -aq --filter name=$GATEWAY_CONTAINER)" ]; then
    docker rm -f $GATEWAY_CONTAINER
fi

if [ "$(docker ps -aq --filter name=$REDIS_CONTAINER)" ]; then
    docker rm -f $REDIS_CONTAINER
fi

if [ "$(docker ps -aq --filter name=$MONGO_CONTAINER)" ]; then
    docker rm -f $MONGO_CONTAINER
fi

if [ "$(docker ps -aq --filter name=$MQ_CONTAINER)" ]; then
    docker rm -f $MQ_CONTAINER
fi

# Remove dangling images.
if [ "$(docker images -q -f dangling=true)" ]; then
    docker rmi $(docker images -q -f dangling=true)
fi

# Clean up the system.
docker system prune -f

# Create Docker private network if not exist.
if ! [ "$(docker network ls | grep $APP_NETWORK)" ]; then
    docker network create $APP_NETWORK
fi

# Run Redis Docker container inside our appnet private network.
docker run \
-d \
--name $REDIS_CONTAINER \
--network $APP_NETWORK \
--restart unless-stopped \
redis

# Run Mongo Docker container inside our appnet private network.
docker run \
-d \
-e MONGO_INITDB_DATABASE=$DBNAME \
--name mongo-server \
--network $APP_NETWORK \
--restart unless-stopped \
drstearns/mongo1kusers

# Run RabbitMQ Docker container inside our appnet private network.
docker run \
-d \
-p 5672:5672 \
--network $APP_NETWORK \
--name $MQ_CONTAINER \
--hostname $MQ_CONTAINER \
rabbitmq

# Run Gateway Docker container inside our appnet private network.
docker run \
-d \
-p 443:443 \
--name $GATEWAY_CONTAINER \
--network $APP_NETWORK \
-v /etc/letsencrypt:/etc/letsencrypt:ro \
-e TLS_CERT=$TLS_CERT \
-e TLS_KEY=$TLS_KEY \
-e SESSION_KEY=$SESSION_KEY \
-e SERVER_ADDR=$SERVER_ADDR \
-e REDIS_ADDR=$REDIS_ADDR \
-e MONGO_ADDR=$MONGO_ADDR \
-e MQ_ADDR=$MQ_ADDR \
-e DB_NAME=$DB_NAME \
--restart unless-stopped \
zicodeng/$GATEWAY_CONTAINER