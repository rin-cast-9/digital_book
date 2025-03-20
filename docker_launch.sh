#!/bin/bash

if [ "$#" -eq 1 ] && [ "$1" == "1" ]; then
    COMPOSE_CMD="podman compose"
else
    COMPOSE_CMD="docker compose"
fi

echo "Generating Docker nginx.conf..."

sed 's|{{PROXY_TARGET}}|http://blockchain:8545|' ./nginx/nginx.conf.template > ./nginx/nginx.conf

echo "Launching Docker containers..."

$COMPOSE_CMD up -d