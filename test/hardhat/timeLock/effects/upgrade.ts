import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeTimeControllerUpgradeable(): void {
    context("test upgrades", function () {

        it("should successfully call new implementation methods", async function () {

            const AYNITimelockControllerMockFactory = await ethers.getContractFactory("AYNITimelockControllerMock");
            const timeLockControllerMock = await AYNITimelockControllerMockFactory.deploy();
            const newImplementation = await timeLockControllerMock.getAddress();
            const ayniTokenTimeLockControllerProxyAddress = await this.contracts.ayniTimelockController.getAddress();

            await this.contracts.ayniTimelockController.upgradeToAndCall(newImplementation, "0x")

            const ayniTokenUpgraded = await ethers.getContractAt("AYNITimelockControllerMock", ayniTokenTimeLockControllerProxyAddress);
            await ayniTokenUpgraded.testUpgradeability();

        })

        it("cannot update with invalid implementation", async function () {

            const ERC20MockFactory = await ethers.getContractFactory("ERC20Mock");
            const erc20Mock = await ERC20MockFactory.deploy();

            const unSupportedImplementation = await erc20Mock.getAddress();
            await expect(this.contracts.ayniTimelockController.upgradeToAndCall(unSupportedImplementation, "0x")).to.be.revertedWithCustomError(this.contracts.ayniTimelockController, "ERC1967InvalidImplementation")
        });

        it("cannot update with not non admin account", async function () {

            const currentTokenImpl = await this.contracts.ayniTimelockControllerImplementation.getAddress()

            await expect(this.contracts.ayniTimelockController.connect(this.signers.accounts[0]).upgradeToAndCall(currentTokenImpl, "0x")).to.be.revertedWithCustomError(this.contracts.ayniTimelockController, "NOT_ADMIN");

        })

        it("should not initialize again after the intialization", async function () {
            const proposers = [this.signers.deployer.address];
            const executors = [this.signers.deployer.address];
            const minDelay = 86400; // 1 day in seconds
            const admin = this.signers.deployer.address

            await expect(this.contracts.ayniTimelockController.initialize(
                minDelay,
                proposers,
                executors,
                admin)
            ).to.be.revertedWithCustomError(this.contracts.ayniTimelockController, "InvalidInitialization");

        })
    });

}

