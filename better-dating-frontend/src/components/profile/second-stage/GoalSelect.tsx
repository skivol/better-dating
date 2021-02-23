import { Select } from "mui-rff";
import * as Messages from "./Messages";
import { PaperGrid } from "../../common";

const goalOptions = [
  {
    label: Messages.findSoulMate,
    value: "findSoulMate",
  },
];
export const GoalSelect = ({ nameAdjuster }: any) => (
  <PaperGrid>
    <Select
      disabled
      required
      name={nameAdjuster("goal")}
      label={Messages.goal}
      value="findSoulMate"
      data={goalOptions}
    />
  </PaperGrid>
);
