import {
    Button,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as Messages from '../Messages';
import { SpinnerAdornment } from '../common';


export const ViewOtherUserProfileConfirm = ({ loading, dialogIsOpen, closeDialog, onRequestViewAuthorsProfile }: any) => (
    <Dialog
        open={dialogIsOpen}
        onClose={closeDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
    >
        <DialogTitle id="alert-dialog-title">{Messages.areYouSureThatWantToSeeAuthorsProfile}</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                <Alert severity="info">{Messages.whenYouLookAtOtherUserProfileThenOwnerWillKnowAboutThis}</Alert>
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={closeDialog} color="secondary">
                {Messages.cancel}
            </Button>
            <Button onClick={onRequestViewAuthorsProfile} color="primary" autoFocus startIcon={loading && <SpinnerAdornment color="gray" />} disabled={loading}>
                {Messages.yesContinue}
            </Button>
        </DialogActions>
    </Dialog>

);