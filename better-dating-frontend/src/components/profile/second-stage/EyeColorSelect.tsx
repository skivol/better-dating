import { Link } from "@material-ui/core";
import { Select } from "mui-rff";
import { required } from "../../../utils";
import { PaperGrid } from "../../common";
import * as Messages from "./Messages";

const eyeColorOptions = [
  {
    label: Messages.darkBlue,
    value: "DarkBlue",
  },
  {
    label: Messages.blue,
    value: "Blue",
  },
  {
    label: Messages.grayEyeColor,
    value: "Gray",
  },
  {
    label: Messages.green,
    value: "Green",
  },
  {
    label: Messages.amber,
    value: "Amber",
  },
  {
    label: Messages.olive,
    value: "Olive",
  },
  {
    label: Messages.brownEyeColor,
    value: "Brown",
  },
  {
    label: Messages.blackEyeColor,
    value: "Black",
  },
  {
    label: Messages.yellow,
    value: "Yellow",
  },
].sort((a, b) => (a.label > b.label ? 1 : 0));

const helpLink = "https://ru.wikipedia.org/wiki/Цвет_глаз";
export const EyeColorSelect = ({ nameAdjuster, readonly }: any) => (
  <PaperGrid>
    <Select
      disabled={readonly}
      fieldProps={{ validate: required }}
      name={nameAdjuster("eyeColor")}
      helperText={(<Link href={helpLink}>{Messages.wiki}</Link>) as any}
      label={Messages.eyeColor}
      data={eyeColorOptions}
    />
  </PaperGrid>
);
