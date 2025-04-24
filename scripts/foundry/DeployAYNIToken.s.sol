// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.23;

import { BaseScript } from "./Base.s.sol";
import { AYNIToken } from "contracts/AYNIToken.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { console } from "forge-std/src/console.sol";

contract DeployAYNIToken is BaseScript {
    function run() public virtual broadcast returns (AYNIToken ayniToken) {
        address deployer = vm.addr(vm.envUint("PRIVATE_KEY"));

        vm.startBroadcast();

        AYNIToken implementation = new AYNIToken();

        bytes memory data = abi.encodeWithSelector(
            AYNIToken.initialize.selector,
            deployer
        );

        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            data
        );

        vm.stopBroadcast();

        console.log("Implementation:", address(implementation));
        console.log("Proxy:", address(proxy));

        return ayniToken;
    }
}
