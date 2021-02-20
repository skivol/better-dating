import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import { Form, FormSpy } from "react-final-form";
import * as Messages from "../../Messages";
import { storageCreator, currentTime } from "../../../utils";
import { SpinnerAdornment, ClearButton } from "../../common";
import { SecondStageProfile } from ".";

const storage = storageCreator("second-stage-data");
export const SecondStageEnableDialog = ({
  loading,
  dialogIsOpen,
  closeDialog,
  onEnableSecondStage,
}: any) => {
  const initialValues = { goal: "findSoulMate", ...storage.load() };
  const [formKey, setFormKey] = useState(currentTime());
  const reset = () => {
    storage.clear();
    setFormKey(currentTime()); // re-create form completely to avoid validation errors after reset
  };

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
        key={formKey}
        initialValues={initialValues}
        onSubmit={onEnableSecondStage}
        render={({ handleSubmit }) => {
          const storedData = storage.load();
          const hasData = Object.keys(storedData).length > 1;

          const disabledProceedButton = loading;
          return (
            <form onSubmit={handleSubmit}>
              <FormSpy
                subscription={{ values: true }}
                onChange={(props) => {
                  // save the progress
                  storage.save(props.values);
                }}
              />
              <DialogContent>
                <SecondStageProfile initialValues={initialValues} />
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
              {hasData && <ClearButton onClick={reset} />}
            </form>
          );
        }}
      />
    </Dialog>
  );
};
