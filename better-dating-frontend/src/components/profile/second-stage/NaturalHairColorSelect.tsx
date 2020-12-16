import { Link } from "@material-ui/core";
import { Select } from "mui-rff";
import { required } from "../../../utils";
import * as Messages from "./Messages";

const naturalHairColorOptions = [
  {
    label: Messages.black,
    value: "black",
  },
  {
    label: Messages.ginger,
    value: "ginger",
  },
  {
    label: Messages.blond,
    value: "blond",
  },
  {
    label: Messages.brown,
    value: "brown",
  },
  {
    label: Messages.fair,
    value: "fair",
  },
  {
    label: Messages.gray,
    value: "gray",
  },
].sort((a, b) => (a.label > b.label ? 1 : 0));

const helpLink = "https://ru.wikipedia.org/wiki/Пигментация_волос";
export const NaturalHairColorSelect = () => (
  <Select
    name="naturalHairColor"
    helperText={<Link href={helpLink}>{Messages.hairPigmentation}</Link>}
    label={Messages.naturalHairColor}
    data={naturalHairColorOptions}
    fieldProps={{ validate: required }}
    style={{ width: 500 }}
  />
);
