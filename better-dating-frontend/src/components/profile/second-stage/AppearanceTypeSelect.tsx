import { Select } from "mui-rff";
import { required } from "../../../utils";
import * as Messages from "./Messages";

const appearanceOptions = [
  {
    label: Messages.european,
    value: "european",
  },
  {
    label: Messages.oriental,
    value: "oriental",
  },
  {
    label: Messages.caucasian,
    value: "caucasian",
  },
  {
    label: Messages.indian,
    value: "indian",
  },
  {
    label: Messages.darkSkinned,
    value: "darkSkinned",
  },
  {
    label: Messages.hispanic,
    value: "hispanic",
  },
  {
    label: Messages.middleEastern,
    value: "middleEastern",
  },
  {
    label: Messages.american,
    value: "american",
  },
  {
    label: Messages.mixed,
    value: "mixed",
  },
].sort((a, b) => (a.label > b.label ? 1 : 0));

export const AppearanceTypeSelect = ({ nameAdjuster }: any) => {
  return (
    <Select
      fieldProps={{ validate: required }}
      name={nameAdjuster("appearanceType")}
      label={Messages.appearanceType}
      data={appearanceOptions}
      style={{ width: 500 }}
    />
  );
};
