import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

import type { AYNIToken } from "../../../types/contracts/AYNIToken.sol";
import type { AYNITimelockController } from "../../../types/contracts/AYNITimelockController";
import { AYNIGovernor } from "../../../types";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    contracts: Contracts;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Contracts {
  ayniToken: AYNIToken;
  ayniTokenImplementation: AYNIToken;
  ayniGovernor: AYNIGovernor;
  ayniGovernorImplementation: AYNIGovernor;
  ayniTimelockController: AYNITimelockController;
}

export interface Signers {
  deployer: SignerWithAddress;
  accounts: SignerWithAddress[];
}
