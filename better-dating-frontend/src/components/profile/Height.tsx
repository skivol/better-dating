import { TextField } from "mui-rff";
import { InputAdornment } from "@material-ui/core";
import { validateHeight } from "../../utils/ValidationUtils";
import { PaperGrid } from "../common";
import * as Messages from "../Messages";

// Рост (см)
export const Height = ({ readonly }: any) => (
  <PaperGrid>
    <TextField
      required
      disabled={readonly}
      name="height"
      label={Messages.height}
      variant="outlined"
      type="number"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">{Messages.cm}</InputAdornment>
        ),
      }}
      inputProps={{
        "aria-label": Messages.height,
      }}
      fieldProps={{ validate: validateHeight }}
    />
  </PaperGrid>
);
