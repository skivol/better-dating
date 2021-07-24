import { Switches } from "mui-rff";
import { PaperGrid } from "../../common";
import * as Messages from "./Messages";

export const ParticipateInAutomatedPairMatchingAndDateOrganization = ({
  nameAdjuster,
}: any) => (
  <PaperGrid>
    <Switches
      name={nameAdjuster(
        "participateInAutomatedPairMatchingAndDateOrganization"
      )}
      defaultChecked
      helperText={Messages.automatedDatesExplained}
      data={{
        label: Messages.participateInAutomatedPairMatchingAndDateOrganization,
        value: true,
      }}
    />
  </PaperGrid>
);
