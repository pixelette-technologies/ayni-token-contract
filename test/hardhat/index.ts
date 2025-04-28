import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

import { testAYNIToken } from "./ayniToken/AYNIToken";
import type { Contracts, Signers } from "./shared/types";
import { testAYNITimeLockController } from "./timeLock/AYNITimeLockController";
import { testAYNIGovernor } from "./governor/AYNIGovernor";

describe("Test Cases", function () {
  before(async function () {
    this.signers = {} as Signers;
    this.contracts = {} as Contracts;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.deployer = signers[0];
    this.signers.accounts = signers.slice(1);

    this.loadFixture = loadFixture;
  });

  describe("AYNI Token Unit Tests", function () {
    testAYNIToken();
  });

  describe("AYNI TimeLock Controller Unit Tests", function () {
    testAYNITimeLockController();
  });

  describe("AYNI Governor Unit Tests", function () {
    testAYNIGovernor();
  });
});
