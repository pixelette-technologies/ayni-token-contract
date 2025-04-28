import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeUpgradeable(): void {
    context("test upgrades", function () {
        before(async function () {
            // Deploy the new token implementation contract
            const ERC20MockFactory = await ethers.getContractFactory("ERC20Mock");
            const erc20Mock = await ERC20MockFactory.deploy();

            this.unSupportedImplementation = await erc20Mock.getAddress();

        })

        it("should successfully call new implementation methods", async function() {

            const AYNITokenMockFactory = await ethers.getContractFactory("AYNITokenMock");
            const erc20Mock = await AYNITokenMockFactory.deploy();
            const newImplementation = await erc20Mock.getAddress();
            const ayniTokenProxyAddress = await this.contracts.ayniToken.getAddress();

            await this.contracts.ayniToken.upgradeToAndCall(newImplementation, "0x")

            const ayniTokenUpgraded = await ethers.getContractAt("AYNITokenMock", ayniTokenProxyAddress);
            await ayniTokenUpgraded.mintWithoutMaxSupply(this.signers.accounts[0].address, ethers.parseUnits("806451613", 18));
        
        })

        it("cannot update with invalid implementation", async function () {

            await expect(this.contracts.ayniToken.upgradeToAndCall(this.unSupportedImplementation, "0x")).to.be.revertedWithCustomError(this.contracts.ayniToken, "ERC1967InvalidImplementation");
        });

        it("cannot update with not non admin account", async function() {

            const  currentTokenImpl = await this.contracts.ayniTokenImplementation.getAddress()

            await expect(this.contracts.ayniToken.connect(this.signers.accounts[0]).upgradeToAndCall(currentTokenImpl, "0x")).to.be.revertedWithCustomError(this.contracts.ayniToken, "NOT_ADMIN");

        })

        it("should not initialize again after the intialization", async function () {

            await expect(this.contracts.ayniToken.initialize(this.signers.deployer.address)).to.be.revertedWithCustomError(this.contracts.ayniToken, "InvalidInitialization");

        })
    });

}
