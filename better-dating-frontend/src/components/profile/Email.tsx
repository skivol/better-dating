import { InputAdornment } from "@material-ui/core";
import { TextField } from "mui-rff";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { validateEmail } from "../../utils";
import * as Messages from "../Messages";
import { PaperGrid } from "../common";

type Props = {
  label?: string;
  elevation?: number;
};

/* Почта (для авторизации / обратной связи / организации свиданий) */
export const Email = ({ label = Messages.Email, elevation = 3 }: Props) => (
  <PaperGrid elevation={elevation}>
    <TextField
      required
      name="email"
      type="email"
      label={label}
      variant="outlined"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <FontAwesomeIcon icon={faEnvelope} size="lg" />
          </InputAdornment>
        ),
      }}
      inputProps={{
        "aria-label": label,
      }}
      fieldProps={{ validate: validateEmail }}
    />
  </PaperGrid>
);
