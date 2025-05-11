import { ethers } from "ethers";

// import { abi as BookManagerAbi } from "../artifacts/contracts/BookManager.sol/BookManager.json";

const modules = import.meta.env.VITE_DOCKER
    ? import.meta.glob("../artifacts/contracts/BookManager.sol/BookManager.json", { eager: true })
    : import.meta.glob("../../../blockchain/artifacts/contracts/BookManager.sol/BookManager.json", { eager: true });

const BookManagerAbi = modules[Object.keys(modules)[0]]?.abi;

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const OPERATOR_ROLE = "0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929";
export const MANAGER_ROLE = "0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08";
export const USER_ROLE = "0x14823911f2da1b49f045a0929a60b8c1f2a7fc8c06c7284ca3e8ab4e193a08c8";

export const provider = new ethers.JsonRpcProvider(`http://${window.location.hostname}:8545/`);

export const BookManagerContract = new ethers.Contract(CONTRACT_ADDRESS, BookManagerAbi, provider);
