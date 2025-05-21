import { helperConfigFixture } from "../shared/HelperConfig.fixture";
import { shouldBehaveLikeGovernorContract } from "./AYNIGovernor.behavior";

export function testAYNIGovernor(): void {
  describe("AYNIGovernor", function () {
    beforeEach(async function () {
      const { ayniGovernor, ayniTimelock, ayniGovernorImplementation } = await this.loadFixture(helperConfigFixture);
      this.contracts.ayniGovernor = ayniGovernor;
      this.contracts.ayniGovernorImplementation = ayniGovernorImplementation;
      this.contracts.ayniTimelockController = ayniTimelock;

    });

    shouldBehaveLikeGovernorContract();
  });
}
