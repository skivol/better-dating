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
  <Grid container direction="column" className="u-padding-10px" spacing={2}>
    <MissingOptionsNotification />
    <GoalSelect nameAdjuster={nameAdjuster} />
    <PopulatedLocalityAutocomplete
      nameAdjuster={nameAdjuster}
      initialValue={populatedLocality}
    />
    <NativeLanguagesAutocomplete
      nameAdjuster={nameAdjuster}
      initialValues={nativeLanguages}
    />
    <AppearanceTypeSelect nameAdjuster={nameAdjuster} />
    <NaturalHairColorSelect nameAdjuster={nameAdjuster} />
    <EyeColorSelect nameAdjuster={nameAdjuster} />
    <InterestsAutocomplete
      nameAdjuster={nameAdjuster}
      initialValues={interests}
    />
    <PersonalQualityAutocomplete
      name={nameAdjuster("likedPersonalQualities")}
      initialValues={likedPersonalQualities}
      label={LocalMessages.likedPersonalQualities}
    />
    <PersonalQualityAutocomplete
      name={nameAdjuster("dislikedPersonalQualities")}
      initialValues={dislikedPersonalQualities}
      label={LocalMessages.dislikedPersonalQualities}
    />
  </Grid>
);
