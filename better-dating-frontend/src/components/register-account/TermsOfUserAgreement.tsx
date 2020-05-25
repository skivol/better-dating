import * as React from "react";
import {
    Grid,
    Button,
    FormControlLabel,
    Checkbox,
} from '@material-ui/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons';

import * as Messages from '../Messages';
import TermsOfUsageDialog from './TermsOfUsageDialog';

export default function TermsOfUserAgreement({ input: { onChange, value }, label, ...rest }: any) {
    const [termsOfUsageDialogIsOpen, setTermsOfUsageDialogIsOpen] = React.useState(false);
    const openUsageTermsDialog = () => setTermsOfUsageDialogIsOpen(true);
    const handleClose = () => setTermsOfUsageDialogIsOpen(false);
    const handleConfirm = () => {
        onChange(true);
        handleClose();
    };
    const handleDecline = () => {
        onChange(false);
        handleClose();
    };

    return (
        <Grid container direction="column" alignItems="center" spacing={1}>
            <Grid item>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={openUsageTermsDialog}
                    endIcon={<FontAwesomeIcon icon={faBookOpen} />}
                >
                    {Messages.userAgreement}
                </Button>
            </Grid>
            <Grid item>
                <FormControlLabel
                    value="start"
                    control={
                        <Checkbox required onClick={openUsageTermsDialog} checked={value} color="primary" {...rest} />
                    }
                    label={label}
                    labelPlacement="start"
                />
            </Grid>
            <TermsOfUsageDialog
                handleClose={handleClose}
                handleConfirm={handleConfirm}
                handleDecline={handleDecline}
                open={termsOfUsageDialogIsOpen}
            />
        </Grid>
    );
}
