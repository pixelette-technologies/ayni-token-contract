import shouldBehaveLikeTimeControllerUpgradeable from "./effects/upgrade";

export function shouldBehaveLikeTimeLockControllerContract(): void {

    describe("Effects Functions", function () {
        describe("#upgrade", function () {
            shouldBehaveLikeTimeControllerUpgradeable();
        });

    });
}


