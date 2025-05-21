// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {GovernorUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/GovernorUpgradeable.sol";
import {GovernorCountingSimpleUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorCountingSimpleUpgradeable.sol";
import {GovernorVotesQuorumFractionUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesQuorumFractionUpgradeable.sol";
import {GovernorTimelockControlUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorTimelockControlUpgradeable.sol";
import {TimelockControllerUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/TimelockControllerUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { GovernorSettingsUpgradeable } from "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorSettingsUpgradeable.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";


library Errors {
    error NOT_GOVERNOR();
    error INVALID_VOTING_DELAY();
    error INVALID_VOTING_PERIOD();
    error INVALID_PROPOSAL_THRESHOLD();
}

contract AYNIGovernor is
    GovernorSettingsUpgradeable,
    GovernorCountingSimpleUpgradeable,
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
    uint256 public constant MAX_VOTING_PERIOD = 10 * 86400; // 10 days, in seconds

    /// @notice The min setable voting delay
    uint256 public constant MIN_VOTING_DELAY = 86400; // 1 day, in seconds

    /// @notice The max setable voting delay
    uint256 public constant MAX_VOTING_DELAY = 10 * 86400; // 10 days, in seconds

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize( 
        IVotes _ayniToken,
        TimelockControllerUpgradeable _timelock,
        uint48 _initialVotingDelay,
        uint32 _initialVotingPeriod,
        uint256 _initialProposalThreshold,
        uint256 _quorumPercentage,
        address _admin
       ) public initializer {
        if (_initialVotingDelay < MIN_VOTING_DELAY || _initialVotingDelay > MAX_VOTING_DELAY) {
            revert Errors.INVALID_VOTING_DELAY();
        }

        if (_initialVotingPeriod < MIN_VOTING_PERIOD || _initialVotingPeriod > MAX_VOTING_PERIOD) {
            revert Errors.INVALID_VOTING_PERIOD();
        }

        if (_initialProposalThreshold < MIN_PROPOSAL_THRESHOLD || _initialProposalThreshold > MAX_PROPOSAL_THRESHOLD) {
            revert Errors.INVALID_PROPOSAL_THRESHOLD();
        }

        __Governor_init("AYNIGovernor");
        __GovernorSettings_init(_initialVotingDelay, _initialVotingPeriod, _initialProposalThreshold);
        __GovernorCountingSimple_init();
        __GovernorVotes_init(_ayniToken);
        __GovernorVotesQuorumFraction_init(_quorumPercentage);
        __GovernorTimelockControl_init(_timelock);
        __UUPSUpgradeable_init();
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
    }

    function _authorizeUpgrade(address newImplementation)
    internal onlyGovernance() override {}

    // setter functions
        /**
      * @notice Admin function for setting the voting delay
      * @param newVotingDelay new voting delay, in seconds
      */
     function setVotingDelay(uint48 newVotingDelay) public virtual override {

        if (newVotingDelay < MIN_VOTING_DELAY || newVotingDelay > MAX_VOTING_DELAY) {
            revert Errors.INVALID_VOTING_DELAY();
        }

        super.setVotingDelay(newVotingDelay);
    }

    /**
      * @notice Admin function for setting the voting period
      * @param newVotingPeriod new voting period, in seconds
      */
      
    function setVotingPeriod(uint32 newVotingPeriod) public virtual override {
      
        if (newVotingPeriod < MIN_VOTING_PERIOD || newVotingPeriod > MAX_VOTING_PERIOD) {
            revert Errors.INVALID_VOTING_PERIOD();
        }

        super.setVotingPeriod(newVotingPeriod);
    }

        /**
      * @notice Admin function for setting the proposal threshold
      * @dev newProposalThreshold must be greater than the hardcoded min
      * @param newProposalThreshold new proposal threshold
      */
     function setProposalThreshold(uint256 newProposalThreshold) public virtual override {

        if (newProposalThreshold < MIN_PROPOSAL_THRESHOLD || newProposalThreshold > MAX_PROPOSAL_THRESHOLD) {
            revert Errors.INVALID_PROPOSAL_THRESHOLD();
        }

       super.setProposalThreshold(newProposalThreshold);
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

    function proposalThreshold() public view override(GovernorUpgradeable, GovernorSettingsUpgradeable) returns (uint256) {
        return super.proposalThreshold();
    }

}