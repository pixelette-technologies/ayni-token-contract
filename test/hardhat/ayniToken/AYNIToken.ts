import { helperConfigFixture } from "../shared/HelperConfig.fixture";
import { shouldBehaveLikeAYNITokenContract } from "./AYNIToken.behavior";

export function testAYNIToken(): void {
  describe("AYNIToken", function () {
    beforeEach(async function () {
      const { ayniToken, ayniTokenImplementation } = await this.loadFixture(helperConfigFixture);

      this.contracts.ayniToken = ayniToken;
      this.contracts.ayniTokenImplementation = ayniTokenImplementation;

    });

    shouldBehaveLikeAYNITokenContract();
  });
}
