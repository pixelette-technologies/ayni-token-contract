import { ethers } from "hardhat";

import { verifyContract } from "../utils/verify";

async function main() {
  const { chainId } = await ethers.provider.getNetwork();
  const [deployer] = await ethers.getSigners();

  const contractName = "AYNIToken";
  const contractPath = `contracts/${contractName}.sol:${contractName}`;
  const contractAddress = "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const args: any[] = [deployer.address];

  // don't want to verify on localhost
  if (chainId != 31337n && chainId != 1337n) {
    await verifyContract({
      contractPath,
      contractAddress,
      args,
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
