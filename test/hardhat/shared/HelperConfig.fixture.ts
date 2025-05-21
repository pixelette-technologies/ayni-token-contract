import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, upgrades } from "hardhat";
import {
    AYNIGovernor,
    AYNIGovernor__factory,
    AYNITimelockController,
    AYNITimelockController__factory,
    AYNIToken,
    AYNIToken__factory,
} from "../../../types";

export async function helperConfigFixture(): Promise<{
    ayniToken: AYNIToken;
    ayniTokenImplementation: AYNIToken,
    ayniTimelock: AYNITimelockController;
    ayniGovernor: AYNIGovernor;
    ayniGovernorImplementation: AYNIGovernor;
}> {
    const signers = await ethers.getSigners();
    const deployer: SignerWithAddress = signers[0];

    const AYNITokenFactory: AYNIToken__factory = (await ethers.getContractFactory(
        "AYNIToken"
    )) as AYNIToken__factory;

    const AYNITimelockControllerFactory: AYNITimelockController__factory =
        (await ethers.getContractFactory("AYNITimelockController")) as AYNITimelockController__factory;

    const AYNIGovernorFactory: AYNIGovernor__factory = (await ethers.getContractFactory(
        "AYNIGovernor"
    )) as AYNIGovernor__factory;

    const admin = deployer.address;
    const args = [admin];

    const ayniToken = await upgrades.deployProxy(
        AYNITokenFactory,
        args, // initialze function arguments
        {
            initializer: "initialize",
            kind: "uups",
        }
    );

    await ayniToken.waitForDeployment()

    const ayniTokenImplAddress = await upgrades.erc1967.getImplementationAddress(
        await ayniToken.getAddress()
    );

    const ayniTokenImplementation = await ethers.getContractAt("AYNIToken",ayniTokenImplAddress)

    /*//////////////////////////////////////////////////////////////
                                 GOVERNOR DEPLOYMENT
    //////////////////////////////////////////////////////////////*/

    const proposers = [admin];
    const executors = [admin];
    const minDelay = 86400; // 1 day in seconds

    // Deploy the Timelock contract

     const ayniTimelock = await AYNITimelockControllerFactory.deploy(minDelay, proposers, executors, admin)
     await ayniTimelock.waitForDeployment();

    // Deploy the Governor contract

    const votingDelay = 86400; // 1 day in seconds
    const votingPeriod = 604800; // 7 days in seconds
    const proposalThreshold = ethers.parseUnits("40322580", 18); // 5% of total supply
    const quorumPercentage = 2; // 2% of total supply

    const governorArgs = [
        await ayniToken.getAddress(),
        await ayniTimelock.getAddress(),
        votingDelay,
        votingPeriod,
        proposalThreshold,
        quorumPercentage,
        admin,
    ];

    const ayniGovernor = await upgrades.deployProxy(AYNIGovernorFactory, governorArgs, {
        initializer: "initialize",
        kind: "uups",
    });

    await ayniGovernor.waitForDeployment()


    const ayniGovernorImplAddress = await upgrades.erc1967.getImplementationAddress(
        await ayniGovernor.getAddress()
    );

    const ayniGovernorImplementation = await ethers.getContractAt("AYNIGovernor",ayniGovernorImplAddress)


    return { ayniToken, ayniTokenImplementation, ayniTimelock,  ayniGovernor, ayniGovernorImplementation };
}
