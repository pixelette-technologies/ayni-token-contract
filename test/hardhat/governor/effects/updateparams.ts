import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { AYNIGovernor__factory } from "../../../../types";

export default function shouldBehaveLikeGovernorUpdateParams(): void {
    context("test setter methods", function () {

        it("should validate the Voting Delay", async function () {

            const AYNIGovernorFactory: AYNIGovernor__factory = (await ethers.getContractFactory("AYNIGovernor")) as AYNIGovernor__factory;
            const admin = this.signers.deployer.address;

            const votingDelay = 11 * 86400; // 11 day in seconds, // invalid value
            const votingPeriod = 604800; // 7 days in seconds
            const proposalThreshold = ethers.parseUnits("40322580", 18); // 5% of total supply
            const quorumPercentage = 2; // 2% of total supply

            const governorArgs = [
                await this.contracts.ayniToken.getAddress(),
                await this.contracts.ayniTimelockController.getAddress(),
                votingDelay,
                votingPeriod,
                proposalThreshold,
                quorumPercentage,
                admin,
            ];

            await expect(upgrades.deployProxy(AYNIGovernorFactory, governorArgs, {
                initializer: "initialize",
                kind: "uups",
            })).to.be.revertedWithCustomError(this.contracts.ayniGovernor, "INVALID_VOTING_DELAY");

        });

        it("should validate the Voting Period", async function () {

            const AYNIGovernorFactory: AYNIGovernor__factory = (await ethers.getContractFactory("AYNIGovernor")) as AYNIGovernor__factory;
            const admin = this.signers.deployer.address;

            const votingDelay = 10 * 86400; // 10 days
            const votingPeriod = 11 * 86400; // 11 days
            const proposalThreshold = ethers.parseUnits("40322580", 18); // 5% of total supply
            const quorumPercentage = 2; // 2% of total supply

            const governorArgs = [
                await this.contracts.ayniToken.getAddress(),
                await this.contracts.ayniTimelockController.getAddress(),
                votingDelay,
                votingPeriod,
                proposalThreshold,
                quorumPercentage,
                admin,
            ];

            await expect(upgrades.deployProxy(AYNIGovernorFactory, governorArgs, {
                initializer: "initialize",
                kind: "uups",
            })).to.be.revertedWithCustomError(this.contracts.ayniGovernor, "INVALID_VOTING_PERIOD");

        });

        it("should validate the Proposal Threshold", async function () {

            const AYNIGovernorFactory: AYNIGovernor__factory = (await ethers.getContractFactory("AYNIGovernor")) as AYNIGovernor__factory;
            const admin = this.signers.deployer.address;

            const votingDelay = 10 * 86400; // 10 days
            const votingPeriod = 10 * 86400; // 10 days
            const proposalThreshold = ethers.parseUnits("40322581", 18); // 5%+ of total supply, invalid value
            const quorumPercentage = 2; // 2% of total supply

            const governorArgs = [
                await this.contracts.ayniToken.getAddress(),
                await this.contracts.ayniTimelockController.getAddress(),
                votingDelay,
                votingPeriod,
                proposalThreshold,
                quorumPercentage,
                admin,
            ];

            await expect(upgrades.deployProxy(AYNIGovernorFactory, governorArgs, {
                initializer: "initialize",
                kind: "uups",
            })).to.be.revertedWithCustomError(this.contracts.ayniGovernor, "INVALID_PROPOSAL_THRESHOLD");

        });

    });


}