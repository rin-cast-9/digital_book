import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DigitalBookModule = buildModule("DigitalBookModule", (m) => {
    const bookManager = m.contract("BookManager");

    return { bookManager };
});

export default DigitalBookModule;