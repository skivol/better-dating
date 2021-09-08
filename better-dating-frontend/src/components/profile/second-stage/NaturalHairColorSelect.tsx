import { Link } from "@material-ui/core";
import { Select } from "mui-rff";
import { required } from "../../../utils";
import { PaperGrid } from "../../common";
import * as Messages from "./Messages";

const naturalHairColorOptions = [
  {
    label: Messages.black,
    value: "Black",
  },
  {
    label: Messages.ginger,
    value: "Ginger",
  },
  {
    label: Messages.blond,
    value: "Blond",
  },
  {
    label: Messages.brown,
    value: "Brown",
  },
  {
    label: Messages.fair,
    value: "Fair",
  },
  {
    label: Messages.gray,
    value: "Gray",
  },
].sort((a, b) => (a.label > b.label ? 1 : 0));

const helpLink = "https://ru.wikipedia.org/wiki/Пигментация_волос";
export const NaturalHairColorSelect = ({ nameAdjuster, readonly }: any) => (
  <PaperGrid>
    <Select
      disabled={readonly}
      name={nameAdjuster("naturalHairColor")}
      helperText={
        (<Link href={helpLink}>{Messages.hairPigmentation}</Link>) as any
      }
      label={Messages.naturalHairColor}
      data={naturalHairColorOptions}
      fieldProps={{ validate: required }}
    />
  </PaperGrid>
);
