#!/bin/sh

npx hardhat node --hostname 0.0.0.0 &
NODE_PID=$!

until curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc": "2.0", "method":"eth_chainId", "params": [], "id": 1}' http://localhost:8545 | grep -q '"result"'; do
    echo "Waiting for blockchain to be ready..."
    sleep 2
done
echo "Blockchain is ready. Deploying contracts..."

npx hardhat ignition deploy ./ignition/modules/DigitalBookModule.ts --network localhost

wait $NODE_PID