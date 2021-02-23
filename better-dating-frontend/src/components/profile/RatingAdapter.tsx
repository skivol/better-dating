import { useState } from "react";
import { Typography, Box } from "@material-ui/core";
import { Alert, Rating } from "@material-ui/lab";
import * as Messages from "./Messages";
import { PaperGrid } from "../common";

const personalHealthEvaluationLabels: { [index: string]: string } = {
  1: Messages.awful,
  2: Messages.soSo,
  3: Messages.weak,
  4: Messages.notBad,
  5: Messages.normalHealth,
  6: Messages.aboveAverage,
  7: Messages.good,
  8: Messages.goodPlus,
  9: Messages.wonderful,
  10: Messages.cantBeBetter,
};

export default function RatingAdapter({
  input: { value, ...inputRest },
  meta,
  label,
  ...rest
}: any) {
  const [hoverValue, setHover] = useState(-1);
  const error = meta.touched && meta.error;
  const errorText = error ? ` (${meta.error})` : "";
  return (
    <PaperGrid>
      <Typography
        color={error ? "error" : undefined}
      >{`${label} * ${errorText}`}</Typography>
      <div className="u-center-flex u-margin-bottom-10px">
        <Rating
          precision={1}
          max={10}
          size="medium"
          onChangeActive={(event, newHover) => setHover(newHover)}
          value={value}
          {...rest}
          {...inputRest}
        />
        {value !== null && (
          <Box ml={2}>
            {
              personalHealthEvaluationLabels[
                hoverValue !== -1 ? hoverValue : value
              ]
            }
          </Box>
        )}
      </div>
      <Alert variant="outlined" severity="info">
        {Messages.personalHealthEvaluationCriteria}
      </Alert>
    </PaperGrid>
  );
}
