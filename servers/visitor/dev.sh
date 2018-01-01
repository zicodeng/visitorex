#!/usr/bin/env bash

set -e

export SERVER_ADDR='localhost:4000'

export REDIS_ADDR=localhost
export MONGO_ADDR=localhost:27017
export MQ_ADDR=localhost:5672
export DB_NAME="app"

./node_modules/.bin/nodemon index.js