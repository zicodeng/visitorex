#!/usr/bin/env bash

set -e

sh build.sh

export CILENT_CONTAINER=visitorex-client
export SERVER_ADDR=107.170.204.190

docker push zicodeng/$CILENT_CONTAINER

ssh -oStrictHostKeyChecking=no root@$SERVER_ADDR 'bash -s' < run.sh