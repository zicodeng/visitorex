#!usr/bin/env bash

set -e

export VISITOR_CONTAINER=visitorex-visitor-svc
export REDIS_CONTAINER=redis-server
export MONGO_CONTAINER=mongo-server
export MQ_CONTAINER=rabbitmq-server

export SERVER_ADDR=$VISITOR_CONTAINER:80
# No need to specify Redis port here,
# because it is default to 6379.
export REDIS_ADDR=$REDIS_CONTAINER
export MONGO_ADDR=$MONGO_CONTAINER:27017
export MQ_ADDR=$MQ_CONTAINER:5672

export DB_NAME="app"
export APP_NETWORK=appnet

docker pull zicodeng/$VISITOR_CONTAINER

if [ "$(docker ps -aq --filter name=$VISITOR_CONTAINER)" ]; then
    docker rm -f $VISITOR_CONTAINER
fi

if [ "$(docker images -q -f dangling=true)" ]; then
    docker rmi $(docker images -q -f dangling=true)
fi

docker system prune -f

if ! [ "$(docker network ls | grep $APP_NETWORK)" ]; then
    docker network create $APP_NETWORK
fi


docker run \
-d \
-e SERVER_ADDR=$VISITOR_CONTAINER:80 \
-e MQ_ADDR=$MQ_CONTAINER:5672 \
-e MONGO_ADDR=mongo-server:27017 \
-e REDIS_ADDR=$REDIS_ADDR \
-e DB_NAME=$DB_NAME \
--name $VISITOR_CONTAINER \
--network $APP_NETWORK \
--restart unless-stopped \
zicodeng/$VISITOR_CONTAINER