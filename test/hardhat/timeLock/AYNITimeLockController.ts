import { helperConfigFixture } from "../shared/HelperConfig.fixture";
import { shouldBehaveLikeTimeLockControllerContract } from "./AYNITimeLockController.behavior";

export function testAYNITimeLockController(): void {
  describe("AYNITimeLockController", function () {
    beforeEach(async function () {
      const { ayniTimelock, ayniTimelockImplementation } = await this.loadFixture(helperConfigFixture);

      this.contracts.ayniTimelockController = ayniTimelock;
      this.contracts.ayniTimelockControllerImplementation = ayniTimelockImplementation;

    });

    shouldBehaveLikeTimeLockControllerContract();
  });
}
