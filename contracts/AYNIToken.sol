// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC20BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import {ERC20VotesUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import {NoncesUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/NoncesUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

library Errors {
    error NOT_ADMIN();
    error NOT_MINTER();
    error MAX_SUPPLY_REACHED();
}

contract AYNIToken is ERC20BurnableUpgradeable, ERC20PermitUpgradeable, ERC20VotesUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {

    string public constant tokenName = "AYNI Token";
    string public constant tokenSymbol = "AYNI";

    // ROLES
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public constant MAX_SUPPLY = 806_451_613 * 10 ** 18;

    modifier onlyAdmin () {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert Errors.NOT_ADMIN();
        }
        _;
    }

    modifier onlyMinter () {
        if(!hasRole(MINTER_ROLE, msg.sender)) {
            revert Errors.NOT_MINTER();
        }
        _;
    }
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __ERC20_init(tokenName, tokenSymbol);
        __ERC20Permit_init(tokenName);
        __ERC20Votes_init();
        __ERC20Burnable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(MINTER_ROLE, initialOwner);
    }

    /// natspec doc style
    /// @notice Mints `amount` tokens to `to`
    /// @param to The address to mint tokens to
    function mint(address to, uint256 amount) external onlyMinter {
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert Errors.MAX_SUPPLY_REACHED();
        }
        _mint(to, amount);
    }

    function _maxSupply() internal pure override returns (uint256) {
        return MAX_SUPPLY;
    }

    /*//////////////////////////////////////////////////////////////
                      UPGRADEABLE RELATED FUNCTIONS
    //////////////////////////////////////////////////////////////*/


    function _authorizeUpgrade(address newImplementation)
    internal onlyAdmin override {}


    /*//////////////////////////////////////////////////////////////
                      GOVERNANCE RELATED OVERRIDE FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /// Overrides IERC6372 functions to make the token & governor timestamp-based
    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    /// solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=timestamp";
    }

    /// override function for ERC20VotesUpgradeable
    function _update(address from, address to, uint256 amount) internal override(ERC20Upgradeable, ERC20VotesUpgradeable) {
        super._update(from, to, amount);
    }

    /// override function for ERC20PermitUpgradeable and NoncesUpgradeable
    function nonces(address owner) public view virtual override(ERC20PermitUpgradeable, NoncesUpgradeable) returns (uint256) {
        return super.nonces(owner);
    }
}