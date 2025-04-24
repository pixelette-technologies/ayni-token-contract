// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {GovernorUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/GovernorUpgradeable.sol";
import {GovernorCountingSimpleUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorCountingSimpleUpgradeable.sol";
import {GovernorVotesUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesUpgradeable.sol";
import {GovernorVotesQuorumFractionUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesQuorumFractionUpgradeable.sol";
import {GovernorTimelockControlUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorTimelockControlUpgradeable.sol";
import {TimelockControllerUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/TimelockControllerUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";


library Errors {
    error NOT_ADMIN();
    error INVALID_VOTING_DELAY();
    error INVALID_VOTING_PERIOD();
    error INVALID_PROPOSAL_THRESHOLD();
}

contract AYNIGovernor is
    GovernorUpgradeable,
    GovernorCountingSimpleUpgradeable,
    GovernorVotesUpgradeable,
    GovernorVotesQuorumFractionUpgradeable,
    GovernorTimelockControlUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{   

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/
    /// @notice The minimum setable proposal threshold
    uint256 public constant MIN_PROPOSAL_THRESHOLD = 1000e18; // 1,000 AYNI

    /// @notice The maximum setable proposal threshold
    uint256 public constant MAX_PROPOSAL_THRESHOLD = 40322580e18; // 5% of the total supply of the token

    /// @notice The minimum setable voting period
    uint256 public constant MIN_VOTING_PERIOD = 86400; // 1 day, in seconds

    /// @notice The max setable voting period
    uint256 public constant MAX_VOTING_PERIOD = 7 * 86400; // 7 days, in seconds

    /// @notice The min setable voting delay
    uint256 public constant MIN_VOTING_DELAY = 86400; // 1 day, in seconds

    /// @notice The max setable voting delay
    uint256 public constant MAX_VOTING_DELAY = 10 * 86400; // 10 days, in seconds

    /*//////////////////////////////////////////////////////////////
                                STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    uint256 private s_votingDelay;
    uint256 private s_votingPeriod;
    uint256 private s_proposalThreshold;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    /// @notice An event emitted when the voting delay is set
    event VotingDelaySet(uint256 indexed oldVotingDelay, uint256 indexed newVotingDelay);

    /// @notice An event emitted when the voting period is set
    event VotingPeriodSet(uint256 indexed oldVotingPeriod, uint256 indexed newVotingPeriod);

    /// @notice Emitted when proposal threshold is set
    event ProposalThresholdSet(uint256 indexed oldProposalThreshold, uint256 indexed newProposalThreshold);

    modifier onlyAdmin () {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert Errors.NOT_ADMIN();
        }
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize( 
        IVotes _ayniToken,
        TimelockControllerUpgradeable _timelock,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _proposalThreshold,
        uint256 _quorumPercentage,
        address _admin) public initializer {
        __Governor_init("AYNIGovernor");
        __GovernorCountingSimple_init();
        __GovernorVotes_init(_ayniToken);
        __GovernorVotesQuorumFraction_init(_quorumPercentage);
        __GovernorTimelockControl_init(_timelock);
        __UUPSUpgradeable_init();
        s_votingDelay = _votingDelay;
        s_votingPeriod = _votingPeriod;
        s_proposalThreshold = _proposalThreshold;
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
    }

    function _authorizeUpgrade(address newImplementation)
    internal onlyAdmin override {}

    function votingDelay() public view override returns (uint256) {
        return s_votingDelay;
    }

    function votingPeriod() public view override returns (uint256) {
        return s_votingPeriod;
    }

    function proposalThreshold() public view override returns (uint256) {
        return s_proposalThreshold;
    }


    // setter functions
        /**
      * @notice Admin function for setting the voting delay
      * @param newVotingDelay new voting delay, in seconds
      */
     function setVotingDelay(uint256 newVotingDelay) external {
        if (hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert Errors.NOT_ADMIN();
        }

        if (newVotingDelay < MIN_VOTING_DELAY || newVotingDelay > MAX_VOTING_DELAY) {
            revert Errors.INVALID_VOTING_DELAY();
        }

        emit VotingDelaySet(s_votingDelay, newVotingDelay);
        s_votingDelay = newVotingDelay;
    }

    /**
      * @notice Admin function for setting the voting period
      * @param newVotingPeriod new voting period, in seconds
      */
    function setVotingPeriod(uint256 newVotingPeriod) external {
        if (hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert Errors.NOT_ADMIN();
        }        
        if (newVotingPeriod < MIN_VOTING_PERIOD || newVotingPeriod > MAX_VOTING_PERIOD) {
            revert Errors.INVALID_VOTING_PERIOD();
        }

        emit VotingPeriodSet(s_votingPeriod, newVotingPeriod);
        s_votingPeriod = newVotingPeriod;
    }

        /**
      * @notice Admin function for setting the proposal threshold
      * @dev newProposalThreshold must be greater than the hardcoded min
      * @param newProposalThreshold new proposal threshold
      */
     function setProposalThreshold(uint256 newProposalThreshold) external {
        if (hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert Errors.NOT_ADMIN();
        }

        if (newProposalThreshold < MIN_PROPOSAL_THRESHOLD || newProposalThreshold > MAX_PROPOSAL_THRESHOLD) {
            revert Errors.INVALID_PROPOSAL_THRESHOLD();
        }

        emit ProposalThresholdSet(s_proposalThreshold, newProposalThreshold);
        s_proposalThreshold = newProposalThreshold;
    }

     /**
      * @notice The functions below are overrides required
      */
    function state(uint256 proposalId) public view override(GovernorUpgradeable, GovernorTimelockControlUpgradeable) returns (ProposalState) {
        return super.state(proposalId);
    }

    function proposalNeedsQueuing(
        uint256 proposalId
    ) public view virtual override(GovernorUpgradeable, GovernorTimelockControlUpgradeable) returns (bool) {
        return super.proposalNeedsQueuing(proposalId);
    }

    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(GovernorUpgradeable, GovernorTimelockControlUpgradeable) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(GovernorUpgradeable, GovernorTimelockControlUpgradeable) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(GovernorUpgradeable, GovernorTimelockControlUpgradeable) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor() internal view override(GovernorUpgradeable, GovernorTimelockControlUpgradeable) returns (address) {
        return super._executor();
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(AccessControlUpgradeable, GovernorUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

}