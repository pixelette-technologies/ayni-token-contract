import { helperConfigFixture } from "../shared/HelperConfig.fixture";
import { shouldBehaveLikeAYNITokenContract } from "./AYNIToken.behavior";

export function testAYNIToken(): void {
  describe("AYNIToken", function () {
    beforeEach(async function () {
      const { ayniToken, ayniGovernor, ayniTimelock, ayniTokenImplementation } = await this.loadFixture(helperConfigFixture);

      this.contracts.ayniToken = ayniToken;
      this.contracts.ayniTokenImplementation = ayniTokenImplementation;
      this.contracts.ayniGovernor = ayniGovernor;
      this.contracts.ayniTimelockController = ayniTimelock;

    });

    shouldBehaveLikeAYNITokenContract();
  });
}
