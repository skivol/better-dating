import { Select } from "mui-rff";
import * as Messages from "./Messages";
import { PaperGrid } from "../../common";

const goalOptions = [
  {
    label: Messages.findSoulMate,
    value: "FindSoulMate",
  },
  {
    label: Messages.haveSoulmateWantToCreateFamily,
    value: "HaveSoulmateWantToCreateFamily",
  },
];
export const GoalSelect = ({ nameAdjuster }: any) => (
  <PaperGrid>
    <Select
      disabled
      required
      name={nameAdjuster("goal")}
      label={Messages.goal}
      data={goalOptions}
    />
  </PaperGrid>
);
