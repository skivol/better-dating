import { Grid, Button, FormControlLabel, Checkbox } from "@material-ui/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen } from "@fortawesome/free-solid-svg-icons";

import { useDialog } from "../../utils";
import * as Messages from "../Messages";
import TermsOfUsageDialog from "./TermsOfUsageDialog";

export function TermsOfUserAgreement({
  input: { onChange, value },
  label,
  ...rest
}: any) {
  const { dialogIsOpen, openDialog, closeDialog } = useDialog();
  const handleConfirm = () => {
    onChange(true);
    closeDialog();
  };
  const handleDecline = () => {
    onChange(false);
    closeDialog();
  };

  return (
    <Grid container direction="column" alignItems="center" spacing={1}>
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          onClick={openDialog}
          endIcon={<FontAwesomeIcon icon={faBookOpen} />}
        >
          {Messages.userAgreement}
        </Button>
      </Grid>
      <Grid item>
        <FormControlLabel
          value="start"
          control={
            <Checkbox
              required
              onClick={openDialog}
              checked={value}
              color="primary"
              {...rest}
            />
          }
          label={label}
          labelPlacement="start"
        />
      </Grid>
      <TermsOfUsageDialog
        handleClose={closeDialog}
        handleConfirm={handleConfirm}
        handleDecline={handleDecline}
        open={dialogIsOpen}
      />
    </Grid>
  );
}
