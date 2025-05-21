import { time } from "@nomicfoundation/hardhat-network-helpers";
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

            const governor = this.contracts.ayniGovernor

            // grant GOVERNOR_ROLE from AYNI token contract to the AYNI TimeLock contract 
            const GOVERNOR_ROLE = ethers.id('GOVERNOR_ROLE');
            await this.contracts.ayniToken.grantRole(GOVERNOR_ROLE, await this.contracts.ayniTimelockController.getAddress());

            const maxSupply = await this.contracts.ayniToken.MAX_SUPPLY()
            await this.contracts.ayniToken.mint(this.signers.deployer.address, maxSupply)
            const voter = this.signers.accounts[0];
            await this.contracts.ayniToken.delegate(voter.address)

            const targetContract = this.contracts.ayniToken.getAddress()
            const targets = [targetContract];
            const values = ["0"]
            const data = [this.contracts.ayniToken.interface.encodeFunctionData('upgradeToAndCall', [newImplementation, "0x"])]
            const description = "Updating Implementation of AYNI Token"

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
            await this.contracts.ayniTimelockController.grantRole(GOVERNOR_ROLE, await governor.getAddress());

            expect(await governor.proposalNeedsQueuing(proposalId)).to.equal(true)

            await governor.queue(targets, values, data, hashDescription)

            const timestamp = await governor.proposalEta(proposalId);

            await time.increaseTo(timestamp);        
            await expect(governor.execute(targets, values, data, hashDescription)).to.emit(this.contracts.ayniToken, 'Upgraded').withArgs(newImplementation);

            const ayniTokenUpgraded = await ethers.getContractAt("AYNITokenMock", ayniTokenProxyAddress);
            await ayniTokenUpgraded.mintWithoutMaxSupply(this.signers.accounts[0].address, ethers.parseUnits("806451613", 18));
        
        })

        it("cannot update with invalid implementation", async function () {

            const governor = this.contracts.ayniGovernor

            // grant GOVERNOR_ROLE from AYNI token contract to the AYNI TimeLock contract 
            const GOVERNOR_ROLE = ethers.id('GOVERNOR_ROLE');
            await this.contracts.ayniToken.grantRole(GOVERNOR_ROLE, await this.contracts.ayniTimelockController.getAddress());

            const maxSupply = await this.contracts.ayniToken.MAX_SUPPLY()
            await this.contracts.ayniToken.mint(this.signers.deployer.address, maxSupply)
            const voter = this.signers.accounts[0];
            await this.contracts.ayniToken.delegate(voter.address)

            const targetContract = this.contracts.ayniToken.getAddress()
            const targets = [targetContract];
            const values = ["0"]
            const data = [this.contracts.ayniToken.interface.encodeFunctionData('upgradeToAndCall', [this.unSupportedImplementation, "0x"])]
            const description = "Updating Implementation of AYNI Token"

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
            await this.contracts.ayniTimelockController.grantRole(GOVERNOR_ROLE, await governor.getAddress());

            expect(await governor.proposalNeedsQueuing(proposalId)).to.equal(true)

            await governor.queue(targets, values, data, hashDescription)

            const timestamp = await governor.proposalEta(proposalId);

            await time.increaseTo(timestamp);        
            await expect(governor.execute(targets, values, data, hashDescription)).to.be.revertedWithCustomError(this.contracts.ayniToken, "ERC1967InvalidImplementation");

        });

        it("cannot update with not non admin account", async function() {

            const  currentTokenImpl = await this.contracts.ayniTokenImplementation.getAddress()

            await expect(this.contracts.ayniToken.connect(this.signers.accounts[0]).upgradeToAndCall(currentTokenImpl, "0x")).to.be.revertedWithCustomError(this.contracts.ayniToken, "NOT_GOVERNOR");

        })

        it("should not initialize again after the intialization", async function () {

            await expect(this.contracts.ayniToken.initialize(this.signers.deployer.address)).to.be.revertedWithCustomError(this.contracts.ayniToken, "InvalidInitialization");

        })
    });

}
