import { helperConfigFixture } from "../shared/HelperConfig.fixture";
import { shouldBehaveLikeGovernorContract } from "./AYNIGovernor.behavior";

export function testAYNIGovernor(): void {
  describe("AYNIGovernor", function () {
    beforeEach(async function () {
      const { ayniGovernor, ayniGovernorImplementation } = await this.loadFixture(helperConfigFixture);

      this.contracts.ayniGovernor = ayniGovernor;
      this.contracts.ayniGovernorImplementation = ayniGovernorImplementation;

    });

    shouldBehaveLikeGovernorContract();
  });
}
