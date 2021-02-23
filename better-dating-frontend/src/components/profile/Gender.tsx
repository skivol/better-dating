import { Radios } from "mui-rff";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMale, faFemale } from "@fortawesome/free-solid-svg-icons";
import { PaperGrid } from "../common";
import * as Messages from "../Messages";

const genderRadioData = [
  {
    label: (
      <>
        <FontAwesomeIcon
          style={{ marginRight: "15px" }}
          icon={faFemale}
          size="lg"
        />
        {Messages.female}
      </>
    ),
    value: "female",
  },
  {
    label: (
      <>
        <FontAwesomeIcon
          style={{ marginRight: "15px" }}
          icon={faMale}
          size="lg"
        />
        {Messages.male}
      </>
    ),
    value: "male",
  },
];

// Пол (мужской / женский)
export const Gender = ({ readonly }: any) => (
  <PaperGrid>
    <Radios
      required
      disabled={readonly}
      label={Messages.gender}
      name="gender"
      data={genderRadioData}
      radioGroupProps={{ row: true }}
      inputProps={{
        "aria-label": Messages.gender,
      }}
    />
  </PaperGrid>
);
