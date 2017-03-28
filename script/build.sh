#!/bin/sh

# create folders and compile the mgmt backend
mkdir -p build/certs
if [ ! -f build/certs/key.pem ]; then
  openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -keyout build/certs/key.pem -out build/certs/cert.pem -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.com"
fi
mkdir -p build/logs
mkdir -p build/uploads
mkdir -p build/sql
cp serverFiles/*.sql build/sql
cp serverFiles/mgm.sample.ini build/
cp serverFiles/default.oar build/uploads/00000000-0000-0000-0000-000000000000
node_modules/.bin/webpack --config ./script/server.config.js
