#!/usr/bin/env bash

export CLIENT_CONTAINER=visitorex-client

docker pull zicodeng/$CLIENT_CONTAINER

if [ "$(docker ps -aq --filter name=$CLIENT_CONTAINER)" ]; then
    docker rm -f $CLIENT_CONTAINER
fi

docker image prune -f

docker run -d \
-p 80:80 \
-p 443:443 \
--name $CLIENT_CONTAINER \
-v /etc/letsencrypt:/etc/letsencrypt:ro \
zicodeng/$CLIENT_CONTAINER