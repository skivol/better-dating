import { Select } from "mui-rff";
import * as Messages from "./Messages";

const goalOptions = [
  {
    label: Messages.findSoulMate,
    value: "findSoulMate",
  },
];
export const GoalSelect = () => (
  <Select
    disabled
    required
    name="goal"
    label={Messages.goal}
    value="findSoulMate"
    data={goalOptions}
    style={{ width: 500 }}
  />
);
