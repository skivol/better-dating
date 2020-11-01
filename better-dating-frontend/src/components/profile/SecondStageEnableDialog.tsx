import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@material-ui/core";
import { Form } from "react-final-form";
import * as Messages from "../Messages";
import { SpinnerAdornment } from "../common";
import { PopulatedLocalityAutocomplete } from "./PopulatedLocalityAutocomplete";

export const SecondStageEnableDialog = ({
  loading,
  dialogIsOpen,
  closeDialog,
  onEnableSecondStage,
}: any) => {
  const initialValues = {};

  return (
    <Dialog
      open={dialogIsOpen}
      onClose={closeDialog}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-title"
    >
      <DialogTitle id="dialog-title">
        {Messages.secondStageDialogTitle}
      </DialogTitle>
      <Form
        initialValues={initialValues}
        onSubmit={onEnableSecondStage}
        render={({ handleSubmit, pristine }) => {
          const disabledProceedButton = loading || pristine;
          return (
            <form onSubmit={handleSubmit}>
              <DialogContent>
                <Grid
                  container
                  direction="column"
                  className="u-margin-top-bottom-15px u-padding-10px"
                  spacing={2}
                >
                  <PopulatedLocalityAutocomplete />
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={closeDialog} color="secondary">
                  {Messages.cancel}
                </Button>
                <Button
                  type="submit"
                  className={
                    disabledProceedButton ? "u-color-gray" : "u-color-green"
                  }
                  startIcon={loading && <SpinnerAdornment color="gray" />}
                  disabled={disabledProceedButton}
                >
                  {Messages.yesContinue}
                </Button>
              </DialogActions>
            </form>
          );
        }}
      />
    </Dialog>
  );
};
