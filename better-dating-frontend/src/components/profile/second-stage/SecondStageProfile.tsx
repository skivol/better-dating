import { Grid } from "@material-ui/core";
import * as LocalMessages from "./Messages";
import {
  GoalSelect,
  MissingOptionsNotification,
  PopulatedLocalityAutocomplete,
  NativeLanguagesAutocomplete,
  AppearanceTypeSelect,
  NaturalHairColorSelect,
  EyeColorSelect,
  InterestsAutocomplete,
  PersonalQualityAutocomplete,
} from ".";

export const SecondStageProfile = ({
  initialValues: {
    populatedLocality,
    nativeLanguages,
    interests,
    likedPersonalQualities,
    dislikedPersonalQualities,
  },
  nameAdjuster = (v: string) => v,
}: any) => (
  <Grid
    container
    direction="column"
    className="u-margin-top-bottom-15px u-padding-10px"
    spacing={2}
  >
    <MissingOptionsNotification />
    <div style={{ margin: 10 }} />
    <GoalSelect nameAdjuster={nameAdjuster} />
    <div style={{ margin: 10 }} />
    <PopulatedLocalityAutocomplete
      nameAdjuster={nameAdjuster}
      initialValue={populatedLocality}
    />
    <div style={{ margin: 10 }} />
    <NativeLanguagesAutocomplete
      nameAdjuster={nameAdjuster}
      initialValues={nativeLanguages}
    />
    <div style={{ margin: 10 }} />
    <AppearanceTypeSelect nameAdjuster={nameAdjuster} />
    <div style={{ margin: 10 }} />
    <NaturalHairColorSelect nameAdjuster={nameAdjuster} />
    <div style={{ margin: 10 }} />
    <EyeColorSelect nameAdjuster={nameAdjuster} />
    <div style={{ margin: 10 }} />
    <InterestsAutocomplete
      nameAdjuster={nameAdjuster}
      initialValues={interests}
    />
    <div style={{ margin: 10 }} />
    <PersonalQualityAutocomplete
      name={nameAdjuster("likedPersonalQualities")}
      initialValues={likedPersonalQualities}
      label={LocalMessages.likedPersonalQualities}
    />
    <div style={{ margin: 10 }} />
    <PersonalQualityAutocomplete
      name={nameAdjuster("dislikedPersonalQualities")}
      initialValues={dislikedPersonalQualities}
      label={LocalMessages.dislikedPersonalQualities}
    />
  </Grid>
);
