import { Link } from "@material-ui/core";
import { Select } from "mui-rff";
import { required } from "../../../utils";
import { PaperGrid } from "../../common";
import * as Messages from "./Messages";

const eyeColorOptions = [
  {
    label: Messages.darkBlue,
    value: "darkBlue",
  },
  {
    label: Messages.blue,
    value: "blue",
  },
  {
    label: Messages.grayEyeColor,
    value: "gray",
  },
  {
    label: Messages.green,
    value: "green",
  },
  {
    label: Messages.amber,
    value: "amber",
  },
  {
    label: Messages.olive,
    value: "olive",
  },
  {
    label: Messages.brownEyeColor,
    value: "brown",
  },
  {
    label: Messages.blackEyeColor,
    value: "black",
  },
  {
    label: Messages.yellow,
    value: "yellow",
  },
].sort((a, b) => (a.label > b.label ? 1 : 0));

const helpLink = "https://ru.wikipedia.org/wiki/Цвет_глаз";
export const EyeColorSelect = ({ nameAdjuster }: any) => (
  <PaperGrid>
    <Select
      fieldProps={{ validate: required }}
      name={nameAdjuster("eyeColor")}
      helperText={<Link href={helpLink}>{Messages.wiki}</Link>}
      label={Messages.eyeColor}
      data={eyeColorOptions}
    />
  </PaperGrid>
);
