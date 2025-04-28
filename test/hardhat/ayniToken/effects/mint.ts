import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeMint(): void {
    context("test mint", function () {

        it("should mint the token successfully", async function() {

            const { ayniToken } = this.contracts;
            const mintAmount = ethers.parseEther("1000");
            const recipient = this.signers.deployer.address;

            // Mint tokens
            await ayniToken.mint(recipient, mintAmount);

            // Check the balance of the recipient
            const balance = await ayniToken.balanceOf(recipient);
            expect(balance).to.equal(mintAmount);

            // Check the total supply
            const totalSupply = await ayniToken.totalSupply();
            expect(totalSupply).to.equal(mintAmount);
        
        })

        it("should not mint more that max supply", async function() {
            const { ayniToken } = this.contracts;

            const maxSupply = await ayniToken.MAX_SUPPLY();

            const mintAmount = maxSupply + "1";
            const recipient = this.signers.deployer.address;

            // Attempt to mint tokens
            await expect(ayniToken.mint(recipient, mintAmount)).to.be.revertedWithCustomError(ayniToken, "MAX_SUPPLY_REACHED");
            
        })

        it("should not mint when caller is not minter", async function() {

            const { ayniToken } = this.contracts;

            const mintAmount = ethers.parseEther("1000");
            const recipient = this.signers.accounts[0].address;

            // Attempt to mint tokens
            await expect(ayniToken.connect(this.signers.accounts[0]).mint(recipient, mintAmount)).to.be.revertedWithCustomError(ayniToken, "NOT_MINTER");

            // calling some other functions to complete coverage.

            const clockMode =await ayniToken.CLOCK_MODE();
            expect(clockMode).to.equal("mode=timestamp");

            const nonce = await ayniToken.nonces(this.signers.deployer.address);
            expect(nonce).to.equal(0);

        })

    
    });

}
