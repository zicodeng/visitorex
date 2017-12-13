#!/usr/bin/env bash

set -e

export SERVER_ADDR=localhost:443

export TLS_CERT="$(pwd)/tls/fullchain.pem"
export TLS_KEY="$(pwd)/tls/privkey.pem"

go run main.go