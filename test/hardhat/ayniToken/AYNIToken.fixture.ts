import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { AYNIToken } from "../../../types";
import { helperConfigFixture } from "../shared/HelperConfig.fixture";

export async function ayniTokenFixture(): Promise<{
  ayniToken: AYNIToken,
  ayniTokenImplementation: AYNIToken
}> {

  const { ayniToken, ayniTokenImplementation} = await loadFixture(helperConfigFixture);

  return { ayniToken, ayniTokenImplementation };
}
