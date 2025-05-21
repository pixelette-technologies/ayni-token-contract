import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeGovernorUpgradeable(): void {
    context("test upgradeability", function () {

        it("should successfully call new implementation methods", async function () {

            const AYNIGovernorMockFactory = await ethers.getContractFactory("AYNIGovernorMock");
            const ayniGovernorMock = await AYNIGovernorMockFactory.deploy();
            const newImplementation = await ayniGovernorMock.getAddress();
            const ayniTokenTimeLockControllerProxyAddress = await this.contracts.ayniGovernor.getAddress();

            const governor = this.contracts.ayniGovernor

            const maxSupply = await this.contracts.ayniToken.MAX_SUPPLY()
            await this.contracts.ayniToken.mint(this.signers.deployer.address, maxSupply)
            const voter = this.signers.accounts[0];
            await this.contracts.ayniToken.delegate(voter.address)

            const targetContract = this.contracts.ayniGovernor.getAddress()
            const targets = [targetContract];
            const values = ["0"]
            const data = [this.contracts.ayniGovernor.interface.encodeFunctionData('upgradeToAndCall', [newImplementation, "0x"])]
            const description = "Updating Implementation of AYNI Governor Contract"

            const hashDescription = ethers.id(description)

            await governor.connect(voter).propose(targets, values, data, description);

            const proposalId = await governor.getProposalId(targets, values, data, hashDescription);
            const timepointStart = await governor.proposalSnapshot(proposalId);
            await time.increaseTo(timepointStart);

            const voteType = 1; // For Vote
            await governor.connect(voter).castVote(proposalId, voteType)

            const timepointDeadline = await governor.proposalDeadline(proposalId);
            await time.increaseTo(timepointDeadline);

            const PROPOSER_ROLE = ethers.id('PROPOSER_ROLE');
            const EXECUTOR_ROLE = ethers.id('EXECUTOR_ROLE');

            await this.contracts.ayniTimelockController.grantRole(PROPOSER_ROLE, await governor.getAddress());
            await this.contracts.ayniTimelockController.grantRole(EXECUTOR_ROLE, await governor.getAddress());

            expect(await governor.proposalNeedsQueuing(proposalId)).to.equal(true)

            await governor.queue(targets, values, data, hashDescription)

            const timestamp = await governor.proposalEta(proposalId);

            await time.increaseTo(timestamp);
            await expect(governor.execute(targets, values, data, hashDescription)).to.emit(this.contracts.ayniGovernor, 'Upgraded').withArgs(newImplementation);

            const ayniGovernorUpgraded = await ethers.getContractAt("AYNIGovernorMock", ayniTokenTimeLockControllerProxyAddress);
            expect(await ayniGovernorUpgraded.testUpgradeability()).to.be.equal("true");

        })

        it("cannot update with invalid implementation", async function () {

            const ERC20MockFactory = await ethers.getContractFactory("ERC20Mock");
            const erc20Mock = await ERC20MockFactory.deploy();

            const unSupportedImplementation = await erc20Mock.getAddress();

            const governor = this.contracts.ayniGovernor

            const maxSupply = await this.contracts.ayniToken.MAX_SUPPLY()
            await this.contracts.ayniToken.mint(this.signers.deployer.address, maxSupply)
            const voter = this.signers.accounts[0];
            await this.contracts.ayniToken.delegate(voter.address)

            const targetContract = this.contracts.ayniGovernor.getAddress()
            const targets = [targetContract];
            const values = ["0"]
            const data = [this.contracts.ayniGovernor.interface.encodeFunctionData('upgradeToAndCall', [unSupportedImplementation, "0x"])]
            const description = "Updating Implementation of AYNI Governor Contract"

            const hashDescription = ethers.id(description)

            await governor.connect(voter).propose(targets, values, data, description);

            const proposalId = await governor.getProposalId(targets, values, data, hashDescription);
            const timepointStart = await governor.proposalSnapshot(proposalId);
            await time.increaseTo(timepointStart);

            const voteType = 1; // For Vote
            await governor.connect(voter).castVote(proposalId, voteType)

            const timepointDeadline = await governor.proposalDeadline(proposalId);
            await time.increaseTo(timepointDeadline);

            const PROPOSER_ROLE = ethers.id('PROPOSER_ROLE');
            const EXECUTOR_ROLE = ethers.id('EXECUTOR_ROLE');

            await this.contracts.ayniTimelockController.grantRole(PROPOSER_ROLE, await governor.getAddress());
            await this.contracts.ayniTimelockController.grantRole(EXECUTOR_ROLE, await governor.getAddress());

            expect(await governor.proposalNeedsQueuing(proposalId)).to.equal(true)

            await governor.queue(targets, values, data, hashDescription)

            const timestamp = await governor.proposalEta(proposalId);

            await time.increaseTo(timestamp);
            await expect(governor.execute(targets, values, data, hashDescription)).to.be.revertedWithCustomError(this.contracts.ayniGovernor, "ERC1967InvalidImplementation")

        });

        it("cannot update with not non admin account", async function () {

            const currentTokenImpl = await this.contracts.ayniGovernorImplementation.getAddress()

            await expect(this.contracts.ayniGovernor.connect(this.signers.accounts[0]).upgradeToAndCall(currentTokenImpl, "0x")).to.be.revertedWithCustomError(this.contracts.ayniGovernor, "GovernorOnlyExecutor");

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


