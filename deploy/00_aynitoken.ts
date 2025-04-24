import { upgrades } from "hardhat";
import type { DeployFunction } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

import { preDeploy } from "../utils/contracts";
import { verifyContract } from "../utils/verify";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, getChainId } = hre;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  // initialize Args
  const initialOwner = deployer;
  const args = [initialOwner];

  await preDeploy(deployer, "AYNIToken");

  const AYNITokenFactory = await hre.ethers.getContractFactory("AYNIToken");

  const AYNITokenProxy = await upgrades.deployProxy(
    AYNITokenFactory,
    args, // initialze function arguments
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

  // Verify Contract inside the script
  if (chainId !== "31337" && chainId !== "1337") {
    // ⏳ Wait before verification (optional safety delay)
    await new Promise((res) => setTimeout(res, 10000));

    const contractPath = "contracts/AYNIToken.sol:AYNIToken";

    // ✅ Verify the implementation contract
    try {
      await verifyContract({
        contractPath: contractPath,
        contractAddress: implAddress,
        args: args || [],
      });

      console.log("Implementation verified on Etherscan");
      
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (e: any) {
      console.warn("Verification failed:", e.message);
    }
  }
};

export default func;
func.id = "deploy_ayni_token";
func.tags = ["AYNIToken"];
