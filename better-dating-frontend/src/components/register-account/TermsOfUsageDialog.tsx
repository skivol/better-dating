import { useRef, useEffect } from "react";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@material-ui/core";

import * as Messages from "../Messages";
import { ReactMarkdownMaterialUi } from "../../utils";
// @ts-ignore
import fullTextOfUserAgreement from "../user-agreement/UserAgreement.md";

export interface Props {
  handleClose: () => void;
  handleConfirm: () => void;
  handleDecline: () => void;
  open: boolean;
}

const TermsOfUsageDialog = ({
  handleClose,
  handleConfirm,
  handleDecline,
  open,
}: Props) => {
  const descriptionElementRef = useRef<HTMLElement>(null);
  useEffect(() => {
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
      <DialogContent dividers={false}>
        <DialogContentText
          id="scroll-dialog-description"
          ref={descriptionElementRef}
          tabIndex={-1}
        />
        <ReactMarkdownMaterialUi source={fullTextOfUserAgreement} />
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
