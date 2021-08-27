import { useState } from "react";
import {
  Grid,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarTimes, faClock } from "@fortawesome/free-regular-svg-icons";
import { topRightPosition, ReactMarkdownMaterialUi } from "../../utils";
import { SpinnerAdornment as Spinner } from "../common";
import * as Messages from "./Messages";

export const CancelOrRescheduleDialog = ({
  closeDialog,
  onCancelDate,
  onRescheduleDate,
}: any) => {
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [rescheduling, setRescheduling] = useState<boolean>(false);
  const loading = cancelling || rescheduling;

  return (
    <Dialog
      open
      onClose={closeDialog}
      PaperProps={{ className: "u-min-width-450px" }}
    >
      <DialogContent dividers={false}>
        <DialogTitle>
          <Typography variant="h4">{Messages.cancelOrReschedule}</Typography>
          <IconButton
            aria-label="close"
            style={topRightPosition}
            onClick={closeDialog}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <Grid
          container
          direction="column"
          className="u-padding-10px u-max-width-650px u-center-horizontally"
          spacing={2}
        >
          <Grid item>
            <Alert severity="warning">
              <ReactMarkdownMaterialUi>
                {Messages.cancelDialogInfo}
              </ReactMarkdownMaterialUi>
            </Alert>
          </Grid>
          <Grid item className="u-margin-bottom-10px">
            <Alert severity="info">
              <ReactMarkdownMaterialUi>
                {Messages.rescheduleDialogInfo}
              </ReactMarkdownMaterialUi>
            </Alert>
          </Grid>
          <Grid container justify="flex-end">
            <Button
              className={loading ? "" : "u-color-red"}
              onClick={() => {
                setCancelling(true); // no need to set it to false afterwards as will be directly closed
                onCancelDate();
              }}
              disabled={loading}
              startIcon={
                cancelling ? (
                  <Spinner color="lightgray" />
                ) : (
                  <FontAwesomeIcon icon={faCalendarTimes} />
                )
              }
            >
              {Messages.cancelDate}
            </Button>
            <Button
              color="primary"
              onClick={() => {
                setRescheduling(true); // no need to set it to false afterwards as will be directly closed
                onRescheduleDate();
              }}
              disabled={loading}
              startIcon={
                rescheduling ? (
                  <Spinner color="lightgray" />
                ) : (
                  <FontAwesomeIcon icon={faClock} />
                )
              }
            >
              {Messages.rescheduleDate}
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
