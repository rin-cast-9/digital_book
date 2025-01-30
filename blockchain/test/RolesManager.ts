import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { RolesManager } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("RolesManager", function () {
    async function deployBookManagerContract() {
        const [owner, operatorAccount, managerAccount, userAccount] = await hre.ethers.getSigners();

        const RolesManager = await hre.ethers.getContractFactory("BookManager");
        const rolesManager = await RolesManager.deploy();

        return {
            rolesManager,
            owner,
            operatorAccount,
            managerAccount,
            userAccount,
        };
    }

    let rolesManager: RolesManager;
    let owner: HardhatEthersSigner;
    let operatorAccount: HardhatEthersSigner;
    let managerAccount: HardhatEthersSigner;
    let userAccount: HardhatEthersSigner;

    beforeEach(async () => {
        ({ rolesManager, owner, operatorAccount, managerAccount, userAccount } = await loadFixture(deployBookManagerContract));
    });

    describe("Core functionality", () => {
        describe("Granting roles", () => {
            it("Should add the operator role to operatorAccount", async () => {
                await rolesManager.connect(owner).addOperator(operatorAccount.address);

                expect(await rolesManager.hasRole(await rolesManager.OPERATOR_ROLE(), operatorAccount.address)).to.equal(true);
            });

            it("Should add the manager role to managerAccount", async () => {
                await rolesManager.connect(owner).addManager(managerAccount.address);

                expect(await rolesManager.hasRole(await rolesManager.MANAGER_ROLE(), managerAccount.address)).to.equal(true);
            });

            it("Should add the user role to userAccount", async () => {
                await rolesManager.connect(owner).addManager(managerAccount.address);
                await rolesManager.connect(managerAccount).addUser(userAccount.address);

                expect(await rolesManager.hasRole(await rolesManager.USER_ROLE(), userAccount.address)).to.equal(true);
            });
        });

        describe("Revoking roles", () => {
            beforeEach(async () => {
                await rolesManager.connect(owner).addOperator(operatorAccount.address);
                await rolesManager.connect(owner).addManager(managerAccount.address);
                await rolesManager.connect(managerAccount).addUser(userAccount.address);
            });

            it("Should revoke the operator role from operatorAccount", async () => {
                await rolesManager.connect(owner).revokeOperator(operatorAccount.address);

                expect(await rolesManager.hasRole(await rolesManager.OPERATOR_ROLE(), operatorAccount.address)).to.equal(false);
            });

            it("Should revoke the manager role from managerAccount", async () => {
                await rolesManager.connect(owner).revokeManager(managerAccount.address);

                expect(await rolesManager.hasRole(await rolesManager.MANAGER_ROLE(), managerAccount.address)).to.equal(false);
            });

            it("Should revoke the user role from userAccount", async () => {
                await rolesManager.connect(managerAccount).revokeUser(userAccount.address);

                expect(await rolesManager.hasRole(await rolesManager.USER_ROLE(), userAccount.address)).to.equal(false);
            });
        });

        describe("Unauthorized granting roles", () => {
            const customErrorName = "AccessControlUnauthorizedAccount";

            it("Should fail at granting an operator role using unauthorized account", async () => {
                await expect(rolesManager.connect(userAccount).addOperator(operatorAccount.address)).to.be.revertedWithCustomError(rolesManager, customErrorName);
            });

            it("Should fail at granting a manager role using unauthorized account", async () => {
                await expect(rolesManager.connect(userAccount).addManager(managerAccount.address)).to.be.revertedWithCustomError(rolesManager, customErrorName);
            });

            it("Should fail at granting a user role using unauthorized account", async () => {
                await expect(rolesManager.connect(operatorAccount).addUser(userAccount.address)).to.be.revertedWithCustomError(rolesManager, customErrorName);
            });

            it("Should fail at granting a user role using owner account", async () => {
                await expect(rolesManager.connect(owner).addUser(userAccount.address)).to.be.revertedWithCustomError(rolesManager, customErrorName);
            });
        });

        describe("Unauthorized revoking roles", () => {
            const customErrorName = "AccessControlUnauthorizedAccount";

            beforeEach(async () => {
                await rolesManager.connect(owner).addOperator(operatorAccount.address);
                await rolesManager.connect(owner).addManager(managerAccount.address);
                await rolesManager.connect(managerAccount).addUser(userAccount.address);
            });

            it("Should fail at revoking an operator role using unauthorized account", async () => {
                await expect(rolesManager.connect(userAccount).revokeOperator(operatorAccount.address)).to.be.revertedWithCustomError(rolesManager, customErrorName);
            });

            it("Should fail at revoking a manager role using unauthorized accont", async () => {
                await expect(rolesManager.connect(userAccount).revokeManager(managerAccount.address)).to.be.revertedWithCustomError(rolesManager, customErrorName);
            });

            it("Should fail at revoking a user role using unauthorized account", async () => {
                await expect(rolesManager.connect(operatorAccount).revokeUser(userAccount.address)).to.be.revertedWithCustomError(rolesManager, customErrorName);
            });

            it("Should fail at revoking a user role using owner account", async () => {
                await expect(rolesManager.connect(owner).revokeUser(userAccount.address)).to.be.revertedWithCustomError(rolesManager, customErrorName);
            });
        });
    });
});
