import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import * as Messages from "../Messages";
import { SpinnerAdornment } from "../common";

export const AccountRemovalConfirm = ({
  loading,
  dialogIsOpen,
  closeDialog,
  onProfileRemove,
}: any) => (
  <Dialog
    open={dialogIsOpen}
    onClose={closeDialog}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">
      {Messages.areYouSureThatWantToRemoveProfile}
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        <Alert severity="error">{Messages.thisActionIsIrreversible}</Alert>
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={closeDialog} color="secondary">
        {Messages.cancel}
      </Button>
      <Button
        onClick={onProfileRemove}
        className="u-color-red"
        autoFocus
        startIcon={loading && <SpinnerAdornment color="red" />}
        disabled={loading}
      >
        {Messages.yesContinue}
      </Button>
    </DialogActions>
  </Dialog>
);
