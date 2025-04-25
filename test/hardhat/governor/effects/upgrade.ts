import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeGovernorUpgradeable(): void {
    context("test upgradeability", function () {

        it("should successfully call new implementation methods", async function () {

            const AYNIGovernorMockFactory = await ethers.getContractFactory("AYNIGovernorMock");
            const ayniGovernorMock = await AYNIGovernorMockFactory.deploy();
            const newImplementation = await ayniGovernorMock.getAddress();
            const ayniTokenTimeLockControllerProxyAddress = await this.contracts.ayniGovernor.getAddress();

            await this.contracts.ayniGovernor.upgradeToAndCall(newImplementation, "0x")

            const ayniTokenUpgraded = await ethers.getContractAt("AYNIGovernorMock", ayniTokenTimeLockControllerProxyAddress);
            expect(await ayniTokenUpgraded.testUpgradeability()).to.be.equal("true");

        })

        it("cannot update with invalid implementation", async function () {

            const ERC20MockFactory = await ethers.getContractFactory("ERC20Mock");
            const erc20Mock = await ERC20MockFactory.deploy();

            const unSupportedImplementation = await erc20Mock.getAddress();
            await expect(this.contracts.ayniGovernor.upgradeToAndCall(unSupportedImplementation, "0x")).to.be.revertedWithCustomError(this.contracts.ayniGovernor, "ERC1967InvalidImplementation")

        });

        it("cannot update with not non admin account", async function () {

            const currentTokenImpl = await this.contracts.ayniGovernorImplementation.getAddress()

            await expect(this.contracts.ayniGovernor.connect(this.signers.accounts[0]).upgradeToAndCall(currentTokenImpl, "0x")).to.be.revertedWithCustomError(this.contracts.ayniGovernor, "NOT_ADMIN");

        })

        it("should not initialize again after the intialization", async function () {

          const ayniToken = await this.contracts.ayniToken.getAddress();
          const timelock = await this.contracts.ayniTimelockController.getAddress();
          const votingDelay = 86400; // 1 day in seconds
          const votingPeriod = 604800; // 7 days in seconds
          const proposalThreshold = ethers.parseUnits("40322580", 18); // 5% of total supply
          const quorumPercentage = 2; // 2% of total supply
        

          await expect(this.contracts.ayniGovernor.initialize(
              ayniToken, timelock, votingDelay, votingPeriod, proposalThreshold, quorumPercentage, this.signers.deployer.address)
          ).to.be.revertedWithCustomError(this.contracts.ayniGovernor, "InvalidInitialization");

        })
    });


}


