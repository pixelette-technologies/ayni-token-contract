import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeGovernorProposal(): void {
    context("test proposal", function () {

        it("can setVotingPeriod through governance", async function() {

            const maxSupply = await this.contracts.ayniToken.MAX_SUPPLY()
            await this.contracts.ayniToken.mint(this.signers.deployer.address, maxSupply)
            const voter = this.signers.accounts[0];
            await this.contracts.ayniToken.delegate(voter.address)
            
            const governor = this.contracts.ayniGovernor

            const votingPeriod = 4 * 86400;  // 4 days
            const targetContract = await this.contracts.ayniGovernor.getAddress()
            const targets = [targetContract];
            const values = ["0"]
            const data = [governor.interface.encodeFunctionData('setVotingPeriod',[votingPeriod])]
            const description = "Updating Voting Period"

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

            const previousVotingPeriod = await governor.votingPeriod()
            await expect(governor.execute(targets, values, data, hashDescription)).to.emit(governor, 'VotingPeriodSet').withArgs(previousVotingPeriod, BigInt(votingPeriod));

            expect(await governor.votingPeriod()).to.equal(votingPeriod);

        })

        it("can setVotingDelay through governance", async function() {

            const maxSupply = await this.contracts.ayniToken.MAX_SUPPLY()
            await this.contracts.ayniToken.mint(this.signers.deployer.address, maxSupply)
            const voter = this.signers.accounts[0];
            await this.contracts.ayniToken.delegate(voter.address)
            
            const governor = this.contracts.ayniGovernor

            const votingDelay = 2 * 86400;  // 2 days
            const targetContract = await this.contracts.ayniGovernor.getAddress()
            const targets = [targetContract];
            const values = ["0"]
            const data = [governor.interface.encodeFunctionData('setVotingDelay',[votingDelay])]
            const description = "Updating Voting Delay"

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

            const previousVotingDelay = await governor.votingDelay()
            await expect(governor.execute(targets, values, data, hashDescription)).to.emit(governor, 'VotingDelaySet').withArgs(previousVotingDelay, BigInt(votingDelay));

            expect(await governor.votingDelay()).to.equal(votingDelay);

        })

        it("can setProposalThreshold through governance", async function() {

            const maxSupply = await this.contracts.ayniToken.MAX_SUPPLY()
            await this.contracts.ayniToken.mint(this.signers.deployer.address, maxSupply)
            const voter = this.signers.accounts[0];
            await this.contracts.ayniToken.delegate(voter.address)
            
            const governor = this.contracts.ayniGovernor

            const proposalThreshold = ethers.parseUnits("20000000", 18);
            const targetContract = await this.contracts.ayniGovernor.getAddress()
            const targets = [targetContract];
            const values = ["0"]
            const data = [governor.interface.encodeFunctionData('setProposalThreshold',[proposalThreshold])]
            const description = "Updating Voting Threshold"

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

            const previousProposalThreshold = await governor.proposalThreshold()
            await expect(governor.execute(targets, values, data, hashDescription)).to.emit(governor, 'ProposalThresholdSet').withArgs(previousProposalThreshold, BigInt(proposalThreshold));

            expect(await governor.proposalThreshold()).to.equal(proposalThreshold);

        })

        it("can cancel the proposal when not cancelled, expired or executed", async function() {

            const maxSupply = await this.contracts.ayniToken.MAX_SUPPLY()
            await this.contracts.ayniToken.mint(this.signers.deployer.address, maxSupply)
            const voter = this.signers.accounts[0];
            await this.contracts.ayniToken.delegate(voter.address)
            
            const governor = this.contracts.ayniGovernor

            const proposalThreshold = ethers.parseUnits("20000000", 18);
            const targetContract = await this.contracts.ayniGovernor.getAddress()
            const targets = [targetContract];
            const values = ["0"]
            const data = [governor.interface.encodeFunctionData('setProposalThreshold',[proposalThreshold])]
            const description = "Updating Voting Threshold"

            const hashDescription = ethers.id(description)

            await governor.connect(voter).propose(targets, values, data, description);
            await governor.connect(voter).cancel(targets, values, data, hashDescription)

        })
        
    });


}


