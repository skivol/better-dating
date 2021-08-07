import { Form } from "react-final-form";
import {
  Grid,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { TextField } from "mui-rff";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import { topRightPosition } from "../../utils";
import { SpinnerAdornment as Spinner } from "../common";
import * as Messages from "../Messages";

export const VerifyDateDialog = ({ closeDialog, onVerify, verifying }: any) => (
  <Dialog
    open
    onClose={closeDialog}
    PaperProps={{ className: "u-min-width-450px" }}
  >
    <DialogContent dividers={false}>
      <DialogTitle>
        <IconButton
          aria-label="close"
          style={topRightPosition}
          onClick={closeDialog}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <Form
        onSubmit={onVerify}
        render={({ handleSubmit, pristine }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Grid container>
                <TextField
                  style={{ display: "flex" }}
                  required
                  name="code"
                  label={Messages.code}
                  variant="outlined"
                  type="number"
                  inputProps={{
                    "aria-label": Messages.code,
                  }}
                />
                <Button
                  style={{ marginLeft: "auto" }}
                  color="primary"
                  type="submit"
                  disabled={pristine || verifying}
                  startIcon={
                    verifying ? (
                      <Spinner color="lightgray" />
                    ) : (
                      <FontAwesomeIcon icon={faCheckDouble} />
                    )
                  }
                >
                  {Messages.verifyDate}
                </Button>
              </Grid>
            </form>
          );
        }}
      />
    </DialogContent>
  </Dialog>
);
