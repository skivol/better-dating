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

export const ViewOtherUserProfileConfirm = ({
  title,
  loading,
  dialogIsOpen,
  closeDialog,
  onConfirm,
}: any) => (
  <Dialog
    open={dialogIsOpen}
    onClose={closeDialog}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
    <DialogContent>
      <Alert severity="info">
        <DialogContentText id="alert-dialog-description">
          {Messages.whenYouLookAtOtherUserProfileThenOwnerWillKnowAboutThis}
        </DialogContentText>
      </Alert>
    </DialogContent>
    <DialogActions>
      <Button onClick={closeDialog} color="secondary">
        {Messages.cancel}
      </Button>
      <Button
        onClick={onConfirm}
        color="primary"
        autoFocus
        startIcon={loading && <SpinnerAdornment color="gray" />}
        disabled={loading}
      >
        {Messages.yesContinue}
      </Button>
    </DialogActions>
  </Dialog>
);
