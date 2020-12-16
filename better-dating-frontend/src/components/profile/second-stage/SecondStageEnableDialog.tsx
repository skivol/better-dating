import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@material-ui/core";
import { Form, FormSpy } from "react-final-form";
import * as Messages from "../../Messages";
import * as LocalMessages from "./Messages";
import { storageCreator, currentTime } from "../../../utils";
import { SpinnerAdornment, ClearButton } from "../../common";
import { GoalSelect } from "./GoalSelect";
import { MissingOptionsNotification } from "./MissingOptionsNotification";
import { PopulatedLocalityAutocomplete } from "./PopulatedLocalityAutocomplete";
import { NativeLanguagesAutocomplete } from "./NativeLanguagesAutocomplete";
import { AppearanceTypeSelect } from "./AppearanceTypeSelect";
import { NaturalHairColorSelect } from "./NaturalHairColorSelect";
import { EyeColorSelect } from "./EyeColorSelect";
import { InterestsAutocomplete } from "./InterestsAutocomplete";
import { PersonalQualityAutocomplete } from "./PersonalQualityAutocomplete";

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
                <Grid
                  container
                  direction="column"
                  className="u-margin-top-bottom-15px u-padding-10px"
                  spacing={2}
                >
                  <MissingOptionsNotification />
                  <div style={{ margin: 10 }} />
                  <GoalSelect />
                  <div style={{ margin: 10 }} />
                  <PopulatedLocalityAutocomplete
                    initialValue={initialValues.populatedLocality}
                  />
                  <div style={{ margin: 10 }} />
                  <NativeLanguagesAutocomplete
                    initialValues={initialValues.nativeLanguages}
                  />
                  <div style={{ margin: 10 }} />
                  <AppearanceTypeSelect />
                  <div style={{ margin: 10 }} />
                  <NaturalHairColorSelect />
                  <div style={{ margin: 10 }} />
                  <EyeColorSelect />
                  <div style={{ margin: 10 }} />
                  <InterestsAutocomplete
                    initialValues={initialValues.interests}
                  />
                  <div style={{ margin: 10 }} />
                  <PersonalQualityAutocomplete
                    name="likedPersonalQualities"
                    initialValues={initialValues.likedPersonalQualities}
                    label={LocalMessages.likedPersonalQualities}
                  />
                  <div style={{ margin: 10 }} />
                  <PersonalQualityAutocomplete
                    name="dislikedPersonalQualities"
                    initialValues={initialValues.dislikedPersonalQualities}
                    label={LocalMessages.dislikedPersonalQualities}
                  />
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
              {hasData && <ClearButton onClick={reset} />}
            </form>
          );
        }}
      />
    </Dialog>
  );
};
