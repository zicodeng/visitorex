#!/usr/bin/env bash

set -e

export GATEWAY_CONTAINER=visitorex-api-gateway
export SERVER_ADDR=104.236.129.54

# Build the API server Linux executable and API server Docker container image.
sh build.sh

# Push the image to my DockerHub.
docker push zicodeng/$GATEWAY_CONTAINER

# Send run.sh to the cloud running remotely.
ssh -oStrictHostKeyChecking=no root@$SERVER_ADDR 'bash -s' < run.sh