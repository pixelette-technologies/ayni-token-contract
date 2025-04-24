import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

import type { Contracts, Signers } from "./shared/types";
import { testAYNIToken } from "./ayniToken/AYNIToken";
import { testAYNITimeLockController } from "./timeLock/AYNITimeLockController";

describe("AYNI Token Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;
    this.contracts = {} as Contracts;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.deployer = signers[0];
    this.signers.accounts = signers.slice(1);

    this.loadFixture = loadFixture;
  });

  testAYNIToken();

});

describe("Test Cases", function () {
  before(async function () {
    this.signers = {} as Signers;
    this.contracts = {} as Contracts;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.deployer = signers[0];
    this.signers.accounts = signers.slice(1);

    this.loadFixture = loadFixture;
  });

  testAYNITimeLockController();

});






