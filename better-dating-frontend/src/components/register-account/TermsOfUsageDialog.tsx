import * as React from "react";

import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button
} from '@material-ui/core';

import * as Messages from '../Messages';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import fullTextOfUserAgreement from './UserAgreement.md';
// TODO investigate whether react-markdown could be left out of the client bundle

export interface Props {
    handleClose: () => void;
    handleConfirm: () => void;
    handleDecline: () => void;
    open: boolean;
}

const TermsOfUsageDialog = ({ handleClose, handleConfirm, handleDecline, open }: Props) => {
    const descriptionElementRef = React.useRef<HTMLElement>(null);
    React.useEffect(() => {
        if (open) {
            const { current: descriptionElement } = descriptionElementRef;
            if (descriptionElement !== null) {
                descriptionElement.focus();
            }
        }
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            scroll="body"
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
            PaperProps={{ className: "u-max-width-800px" }}
        >
            <DialogTitle id="scroll-dialog-title">{Messages.userAgreement}</DialogTitle>
            <DialogContent dividers={false}>
                <DialogContentText
                    id="scroll-dialog-description"
                    ref={descriptionElementRef}
                    tabIndex={-1}
                />
                <ReactMarkdown source={fullTextOfUserAgreement} />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDecline} variant="contained">
                    {Messages.decline}
                </Button>
                <Button onClick={handleConfirm} variant="contained" color="primary">
                    {Messages.agreeToTerms}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TermsOfUsageDialog;
