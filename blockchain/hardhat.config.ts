import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const ALCHEMY_API = process.env.ALCHEMY_API;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!ALCHEMY_API || !PRIVATE_KEY) {
  console.error("Missing ALCHEMY_API or PRIVATE_KEY for Arbitrum deployment");
}

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: `http://127.0.0.1:8545`,
    },
    arbitrum: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API || "missing"}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};

export default config;
