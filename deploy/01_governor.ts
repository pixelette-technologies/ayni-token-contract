import { ethers, upgrades } from "hardhat";
import type { DeployFunction, DeployResult } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

import { preDeploy } from "../utils/contracts";
import { verifyContract } from "../utils/verify";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, getChainId, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  /*//////////////////////////////////////////////////////////////
                           TOKEN DEPLOYMENT
  //////////////////////////////////////////////////////////////*/

  // initialize Args
  const initialOwner = deployer;
  const tokenArgs = [initialOwner];

  await preDeploy(deployer, "AYNIToken");

  const AYNITokenFactory = await hre.ethers.getContractFactory("AYNIToken");

  const AYNITokenProxy = await upgrades.deployProxy(
    AYNITokenFactory,
    tokenArgs, // initialze function arguments
    {
      initializer: "initialize",
      kind: "uups",
    }
  );

  const AYNITokenProxyContractAddress = await AYNITokenProxy.getAddress();
  console.log("AYNIToken (Proxy) deployed to:", AYNITokenProxyContractAddress);

  const implAddress = await upgrades.erc1967.getImplementationAddress(
    AYNITokenProxyContractAddress
  );
  console.log("AYNI Token Implementation deployed to:", implAddress);

  /*//////////////////////////////////////////////////////////////
                           TIMELOCK CONTROLLER DEPLOYMENT
  //////////////////////////////////////////////////////////////*/

  const proposers = [deployer];
  const executors = [deployer];
  const minDelay = 86400; // 1 day in seconds
  const admin = deployer

  // Deploy the Timelock contract
  const timelockArgs = [
    minDelay,
    proposers,
    executors,
    admin
  ];

  await preDeploy(deployer, "AYNITimelockController");
  const timeLock: DeployResult = await deploy("AYNITimelockController", {
    from: deployer,
    args: timelockArgs,
    log: true
  });

  console.log("AYNITimeLockController deployed to:", timeLock.address);

  /*//////////////////////////////////////////////////////////////
                           GOVERNOR DEPLOYMENT
  //////////////////////////////////////////////////////////////*/

  
  // Deploy the Governor contract
  const AYNIGovernorFactory = await hre.ethers.getContractFactory("AYNIGovernor");

  const ayniToken = AYNITokenProxyContractAddress;
  const timelock = timeLock.address;
  const votingDelay = 86400; // 1 day in seconds
  const votingPeriod = 604800; // 7 days in seconds
  const proposalThreshold = ethers.parseUnits("40322580", 18); // 5% of total supply
  const quorumPercentage = 2; // 2% of total supply

  const governorArgs = [ayniToken, timelock, votingDelay, votingPeriod, proposalThreshold, quorumPercentage, admin];

  const AYNIGovernor = await upgrades.deployProxy(
    AYNIGovernorFactory,
    governorArgs,
    {
      initializer: "initialize",
      kind: "uups",
    })

  const AYNIGovernorProxy = await AYNIGovernor.getAddress();
  console.log("AYNIGovernor (Proxy) deployed to:", AYNIGovernorProxy);

  const implAddressGovernor = await upgrades.erc1967.getImplementationAddress(
    AYNIGovernorProxy
  );
  console.log("AYNIGovernor Implementation deployed to:", implAddressGovernor);

  // Verify Contract inside the script
  if (chainId !== "31337" && chainId !== "1337") {
    // ⏳ Wait before verification (optional safety delay)
    await new Promise((res) => setTimeout(res, 10000));

    const contractPath = "contracts/AYNIToken.sol:AYNIToken";

    // ✅ Verify the token implementation contract
    try {

      await verifyContract({
        contractPath: contractPath,
        contractAddress: implAddress,
        args: tokenArgs || [],
      });

      console.log("AYNIToken Implementation verified on Etherscan");

      await verifyContract({
        contractPath: "contracts/AYNITimelockController.sol:AYNITimelockController",
        contractAddress: timeLock.address,
        args: timelockArgs || [],
      })

      console.log("AYNITimelockController Implementation verified on Etherscan");

      await verifyContract({
        contractPath: "contracts/AYNIGovernor.sol:AYNIGovernor",
        contractAddress: implAddressGovernor,
        args: governorArgs || [],
      });

      console.log("AYNIGovernor Implementation verified on Etherscan");

    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (e: any) {
      console.warn("Verification failed:", e.message);
    }
  }
};

export default func;
func.id = "deploy_ayni_governor";
func.tags = ["AYNIGovernor"];
