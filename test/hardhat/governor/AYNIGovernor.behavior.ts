import shouldBehaveLikeGovernorProposal from "./effects/proposal";
import shouldBehaveLikeGovernorUpgradeable from "./effects/upgrade";

export function shouldBehaveLikeGovernorContract(): void {

    describe("Effects Functions", function () {
        describe("#upgrade", function () {
            shouldBehaveLikeGovernorUpgradeable();
        });

        describe("proposal creation, voting and execution", function() {
            
            shouldBehaveLikeGovernorProposal();
        })

    });
}


