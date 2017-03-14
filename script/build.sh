#!/bin/bash


# create folders and compile the mgmt backend
mkdir -p build/mgmt/certs
if [ ! -f build/mgmt/certs/key.pem ]; then
  echo "cert does not exist, creating new"
  openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -keyout build/mgmt/certs/key.pem -out build/mgmt/certs/cert.pem -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.com"
fi
mkdir -p build/mgmt/logs
mkdir -p build/mgmt/uploads
mkdir -p build/mgmt/sql
cp serverFiles/*.sql build/mgmt/sql
cp serverFiles/mgm.sample.ini build/mgmt/
cp serverFiles/default.oar build/mgmt/uploads/00000000-0000-0000-0000-000000000000
node_modules/.bin/webpack --config ./script/server.webpack.config.js

