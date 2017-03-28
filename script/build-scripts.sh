#!/bin/sh

mkdir -p build/scripts
node_modules/.bin/webpack --config ./script/create-user.config.js
node_modules/.bin/webpack --config ./script/migrate-db.config.js
node_modules/.bin/webpack --config ./script/template-existing-user.config.js
