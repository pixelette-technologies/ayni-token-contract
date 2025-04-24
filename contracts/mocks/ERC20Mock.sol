// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

error NOT_ADMIN_ROLE();

contract ERC20Mock is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC20("AYNI Mock", "AYNI Mock") {
        _setRoleAdmin(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _mint(msg.sender, 10_000_000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) external {
        _isCallerMinter();
        _mint(to, amount);
    }

    function grantMinterRole(address minter) external {
        _isCallerAdmin();
        grantRole(MINTER_ROLE, minter);
    }

    function _isCallerAdmin() internal view {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert NOT_ADMIN_ROLE();
        }
    }

    function _isCallerMinter() internal view {
        if (!hasRole(MINTER_ROLE, msg.sender)) {
            revert NOT_ADMIN_ROLE();
        }
    }
}
