// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {TimelockControllerUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/TimelockControllerUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

library Errors {
    error NOT_ADMIN();
}

contract AYNITimelockControllerMock is TimelockControllerUpgradeable, UUPSUpgradeable {

    modifier onlyAdmin () {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert Errors.NOT_ADMIN();
        }
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor () {
        _disableInitializers();
    }

    function initialize(uint256 minDelay, address[] memory proposers, address[] memory executors, address admin) public override initializer {
        __UUPSUpgradeable_init();
        __TimelockController_init(minDelay, proposers, executors, admin);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(EXECUTOR_ROLE, address(0));
        _grantRole(EXECUTOR_ROLE, admin);
        _grantRole(PROPOSER_ROLE, admin);
    }

    /*//////////////////////////////////////////////////////////////
                      UPGRADEABLE RELATED FUNCTIONS
    //////////////////////////////////////////////////////////////*/


    function _authorizeUpgrade(address newImplementation)
    internal onlyAdmin override {}

    function testUpgradeability() external pure returns (string memory) {
        return "true";
    }

}