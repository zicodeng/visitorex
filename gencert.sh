#!/usr/bin/env bash

set -e

mkdir -p tls

subj="/CN=localhost"

# We need to add an additional / in front of subj
# if the current OS is Windows,
# because GitBash tries to convert parameters it thinks are file paths
# into Windows-style paths for programs
# that weren't built to run under GitBash (which includes OpenSSL)
if [[ "$OSTYPE" == 'msys' ]]; then
    subj="/$subj"
fi

openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 \
-subj $subj \
-keyout tls/privkey.pem -out tls/fullchain.pem