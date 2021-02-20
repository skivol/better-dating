import { Select } from "mui-rff";
import * as Messages from "./Messages";

const goalOptions = [
  {
    label: Messages.findSoulMate,
    value: "findSoulMate",
  },
];
export const GoalSelect = ({ nameAdjuster }: any) => (
  <Select
    disabled
    required
    name={nameAdjuster("goal")}
    label={Messages.goal}
    value="findSoulMate"
    data={goalOptions}
    style={{ width: 500 }}
  />
);
