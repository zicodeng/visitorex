#!/usr/bin/env bash

set -e

export SERVER_ADDR='localhost:4000'

export REDIS_ADDR=192.168.99.100
export MONGO_ADDR=192.168.99.100:27017
export MQ_ADDR=192.168.99.100:5672
export DB_NAME="app"

./node_modules/.bin/nodemon index.js