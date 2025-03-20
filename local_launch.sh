#!/bin/bash

echo "Generating local nginx.conf..."
sed 's|{{PROXY_TARGET}}|http://127.0.0.1:8545|' ./nginx/nginx.conf.template > ./nginx/nginx.conf

echo "Relaunching nginx server with new config..."
nginx -s reload -c $(pwd)/nginx/nginx.conf

echo "Launching locally..."
cd ./blockchain
yarn install
chmod +x ./entrypoint.sh
./entrypoint.sh &

cd ../frontend
yarn install
yarn dev --host &

wait