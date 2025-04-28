import shouldBehaveLikeMint from "./effects/mint";
import shouldBehaveLikeUpgradeable from "./effects/upgrade";

export function shouldBehaveLikeAYNITokenContract(): void {
    describe("View Functions", function () {

    });

    describe("Effects Functions", function () {
        describe("#upgrade", function () {
            shouldBehaveLikeUpgradeable();
        });

        describe("#mint", function () {
            shouldBehaveLikeMint();
        })
    });
}
