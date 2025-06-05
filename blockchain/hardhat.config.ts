import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const ALCHEMY_API = process.env.ALCHEMY_API;
const PRIVATE_KEY = process.env.PRIVATE_kEY;

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: `http://127.0.0.1:8545`,
    },
    ...(ALCHEMY_API && PRIVATE_KEY
      ? {
        arbitrum: {
          url: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API}`,
          accounts: [PRIVATE_KEY],
        },
      }
      : {}),
  },
};

export default config;
