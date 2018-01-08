#!/usr/bin/env bash

set -e

export VISITOR_CONTAINER=visitorex-visitor-svc
export SERVER_ADDR=104.236.129.54

sh build.sh

docker push zicodeng/$VISITOR_CONTAINER

ssh -oStrictHostKeyChecking=no root@$SERVER_ADDR 'bash -s' < run.sh