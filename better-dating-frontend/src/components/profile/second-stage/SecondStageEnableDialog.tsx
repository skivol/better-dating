import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@material-ui/core";
import { Form } from "react-final-form";
import * as Messages from "../../Messages";
import * as LocalMessages from "./Messages";
import { SpinnerAdornment } from "../../common";
import { GoalSelect } from "./GoalSelect";
import { MissingOptionsNotification } from "./MissingOptionsNotification";
import { PopulatedLocalityAutocomplete } from "./PopulatedLocalityAutocomplete";
import { NativeLanguagesAutocomplete } from "./NativeLanguagesAutocomplete";
import { AppearanceTypeSelect } from "./AppearanceTypeSelect";
import { NaturalHairColorSelect } from "./NaturalHairColorSelect";
import { EyeColorSelect } from "./EyeColorSelect";
import { InterestsAutocomplete } from "./InterestsAutocomplete";
import { PersonalQualityAutocomplete } from "./PersonalQualityAutocomplete";

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
                  <MissingOptionsNotification />
                  <div style={{ margin: 10 }} />
                  <GoalSelect />
                  <div style={{ margin: 10 }} />
                  <PopulatedLocalityAutocomplete />
                  <div style={{ margin: 10 }} />
                  <NativeLanguagesAutocomplete />
                  <div style={{ margin: 10 }} />
                  <AppearanceTypeSelect />
                  <div style={{ margin: 10 }} />
                  <NaturalHairColorSelect />
                  <div style={{ margin: 10 }} />
                  <EyeColorSelect />
                  <div style={{ margin: 10 }} />
                  <InterestsAutocomplete />
                  <div style={{ margin: 10 }} />
                  <PersonalQualityAutocomplete
                    name="likedPersonalQualities"
                    label={LocalMessages.likedPersonalQualities}
                  />
                  <div style={{ margin: 10 }} />
                  <PersonalQualityAutocomplete
                    name="dislikedPersonalQualities"
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
            </form>
          );
        }}
      />
    </Dialog>
  );
};
