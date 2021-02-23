import { TextField } from "mui-rff";
import { InputAdornment } from "@material-ui/core";
import { validateWeight } from "../../utils/ValidationUtils";
import { PaperGrid } from "../common";
import * as Messages from "../Messages";

// Вес (кг)
export const Weight = ({ readonly }: any) => (
  <PaperGrid>
    <TextField
      required
      disabled={readonly}
      name="weight"
      label={Messages.weight}
      variant="outlined"
      type="number"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">{Messages.kg}</InputAdornment>
        ),
      }}
      inputProps={{
        "aria-label": Messages.weight,
      }}
      fieldProps={{ validate: validateWeight }}
    />
  </PaperGrid>
);
