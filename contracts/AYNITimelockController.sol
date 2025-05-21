// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { TimelockController } from "@openzeppelin/contracts/governance/TimelockController.sol";

contract AYNITimelockController is TimelockController {
    
    constructor (uint256 minDelay, address[] memory proposers, address[] memory executors, address admin) TimelockController(minDelay, proposers, executors, admin) {
        _setRoleAdmin(PROPOSER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(EXECUTOR_ROLE, DEFAULT_ADMIN_ROLE);
        _grantRole(EXECUTOR_ROLE, admin);
        _grantRole(PROPOSER_ROLE, admin);
    }

}