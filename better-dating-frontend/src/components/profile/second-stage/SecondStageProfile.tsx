import { Grid } from "@material-ui/core";
import * as LocalMessages from "./Messages";
import {
  ParticipateInAutomatedPairMatchingAndDateOrganization,
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
  readonly = false,
}: any) => (
  <Grid container direction="column" className="u-padding-10px" spacing={2}>
    {!readonly && <MissingOptionsNotification />}
    <GoalSelect nameAdjuster={nameAdjuster} />
    {!readonly && (
      <ParticipateInAutomatedPairMatchingAndDateOrganization
        nameAdjuster={nameAdjuster}
      />
    )}
    <PopulatedLocalityAutocomplete
      readonly={readonly}
      nameAdjuster={nameAdjuster}
      initialValue={populatedLocality}
    />
    <NativeLanguagesAutocomplete
      readonly={readonly}
      nameAdjuster={nameAdjuster}
      initialValues={nativeLanguages}
    />
    <AppearanceTypeSelect readonly={readonly} nameAdjuster={nameAdjuster} />
    <NaturalHairColorSelect readonly={readonly} nameAdjuster={nameAdjuster} />
    <EyeColorSelect readonly={readonly} nameAdjuster={nameAdjuster} />
    <InterestsAutocomplete
      readonly={readonly}
      nameAdjuster={nameAdjuster}
      initialValues={interests}
    />
    <PersonalQualityAutocomplete
      readonly={readonly}
      name={nameAdjuster("likedPersonalQualities")}
      initialValues={likedPersonalQualities}
      label={LocalMessages.likedPersonalQualities}
    />
    <PersonalQualityAutocomplete
      readonly={readonly}
      name={nameAdjuster("dislikedPersonalQualities")}
      initialValues={dislikedPersonalQualities}
      label={LocalMessages.dislikedPersonalQualities}
    />
  </Grid>
);
