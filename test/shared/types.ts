import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

import type { AYNIToken } from "../../types/contracts/AYNIToken.sol";

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
}

export interface Signers {
  deployer: SignerWithAddress;
  accounts: SignerWithAddress[];
}
