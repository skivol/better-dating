import { InputAdornment } from "@material-ui/core";
import { TextField } from "mui-rff";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignature } from "@fortawesome/free-solid-svg-icons";
import { required } from "../../utils";
import { PaperGrid } from "../common";
import * as Messages from "../Messages";

export const Nickname = ({ readonly }: any) => (
  <PaperGrid>
    <TextField
      required
      disabled={readonly}
      name="nickname"
      label={Messages.nickname}
      variant="outlined"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <FontAwesomeIcon icon={faSignature} size="lg" />
          </InputAdornment>
        ),
      }}
      inputProps={{
        "aria-label": Messages.nickname,
      }}
      fieldProps={{ validate: required }}
    />
  </PaperGrid>
);
