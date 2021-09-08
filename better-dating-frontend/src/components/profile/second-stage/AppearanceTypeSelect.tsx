import { Select } from "mui-rff";
import { PaperGrid } from "../../common";
import { required } from "../../../utils";
import * as Messages from "./Messages";

const appearanceOptions = [
  {
    label: Messages.european,
    value: "European",
  },
  {
    label: Messages.oriental,
    value: "Oriental",
  },
  {
    label: Messages.caucasian,
    value: "Caucasian",
  },
  {
    label: Messages.indian,
    value: "Indian",
  },
  {
    label: Messages.darkSkinned,
    value: "DarkSkinned",
  },
  {
    label: Messages.hispanic,
    value: "Hispanic",
  },
  {
    label: Messages.middleEastern,
    value: "MiddleEastern",
  },
  {
    label: Messages.american,
    value: "American",
  },
  {
    label: Messages.mixed,
    value: "Mixed",
  },
].sort((a, b) => (a.label > b.label ? 1 : 0));

export const AppearanceTypeSelect = ({ nameAdjuster, readonly }: any) => {
  return (
    <PaperGrid>
      <Select
        disabled={readonly}
        fieldProps={{ validate: required }}
        name={nameAdjuster("appearanceType")}
        label={Messages.appearanceType}
        data={appearanceOptions}
      />
    </PaperGrid>
  );
};
