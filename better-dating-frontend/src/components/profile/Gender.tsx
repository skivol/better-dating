import { Grid, Paper } from "@material-ui/core";
import { Radios } from "mui-rff";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMale, faFemale } from "@fortawesome/free-solid-svg-icons";
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
  <Grid item>
    <Paper
      elevation={3}
      className="u-padding-16px u-center-horizontally u-max-width-450px"
    >
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
    </Paper>
  </Grid>
);
