import { useState, useEffect, ChangeEvent } from "react";
import { useDispatch } from "react-redux";
import { FormApi } from "final-form";
import { Form } from "react-final-form";
import { AppBar, Tabs, Tab, Grid, Typography, Paper } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdCard } from "@fortawesome/free-solid-svg-icons";

import * as actions from "../actions";
import {
  emailHasChanged,
  useMenu,
  useDialog,
  fromBackendProfileValues,
} from "../utils";
import * as Messages from "./Messages";
import {
  ProfileFormData,
  FirstStageProfile,
  SecondStageProfile,
  ControlButtons,
  EllipsisMenu,
  AccountRemovalConfirm,
  ViewOtherUserProfileConfirm,
  SecondStageEnableDialog,
} from "./profile";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(1),
    },
    icon: {
      marginRight: theme.spacing(1),
    },
  })
);

type Props = {
  profileData: ProfileFormData;
  readonly: boolean;
};

export const Profile = ({ profileData, readonly = false }: Props) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { anchorEl, menuIsOpen, openMenu, closeMenu } = useMenu();
  const { dialogIsOpen, openDialog, closeDialog } = useDialog();
  const [dialogType, setDialogType] = useState<string | null>(null);

  const onSubmit = (values: any, form: FormApi<any>) => {
    setSaving(true);
    dispatch(actions.updateAccount(values, emailHasChanged(form)))
      .then((response: any) =>
        setInitialValues(fromBackendProfileValues(response))
      )
      .finally(() => setSaving(false));
  };
  const onProfileRemove = () => {
    setLoading(true);
    dispatch(actions.requestAccountRemoval())
      .then(() => {
        closeDialog();
        setDialogType(null);
      })
      .finally(() => setLoading(false));
  };
  const onRequestViewAuthorsProfile = () => {
    setLoading(true);
    dispatch(actions.viewAuthorsProfile())
      .then(() => {
        closeDialog();
        setDialogType(null);
      })
      .finally(() => setLoading(false));
  };
  const onSecondStageActivationRequest = (values: any) => {
    setLoading(true);
    dispatch(actions.activateSecondStage(values))
      .then(() => {
        closeDialog();
        setDialogType(null);
      })
      .finally(() => setLoading(false));
  };

  const classes = useStyles();
  const profileDataWithDate = fromBackendProfileValues(profileData);
  const [initialValues, setInitialValues] = useState(profileDataWithDate);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (showAnalysis) {
      setTimeout(
        () =>
          document
            .getElementById("birthday")
            ?.scrollIntoView({ behavior: "smooth" }),
        1000
      );
    }
  }, [showAnalysis]);

  const showDialog = (type: string) => {
    closeMenu();
    openDialog();
    setDialogType(type);
  };
  let dialog = null;
  if (dialogType === "accountRemoval") {
    dialog = (
      <AccountRemovalConfirm
        loading={loading}
        dialogIsOpen={dialogIsOpen}
        closeDialog={closeDialog}
        onProfileRemove={onProfileRemove}
      />
    );
  } else if (dialogType === "viewAuthorsProfile") {
    dialog = (
      <ViewOtherUserProfileConfirm
        loading={loading}
        dialogIsOpen={dialogIsOpen}
        closeDialog={closeDialog}
        onRequestViewAuthorsProfile={onRequestViewAuthorsProfile}
      />
    );
  } else if (dialogType === "enableSecondStage") {
    dialog = (
      <SecondStageEnableDialog
        loading={loading}
        dialogIsOpen={dialogIsOpen}
        closeDialog={closeDialog}
        onEnableSecondStage={onSecondStageActivationRequest}
      />
    );
  }

  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: ChangeEvent<unknown>, newTab: number) => {
    setSelectedTab(newTab);
  };

  const nameAdjuster = (v: string) => `secondStageData.${v}`;
  return (
    <>
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        render={({ handleSubmit, values, pristine }) => {
          console.log({ values });
          const secondStageEnabled = values.secondStageData !== undefined;
          return (
            <form onSubmit={handleSubmit}>
              <Grid
                container
                direction="column"
                className="u-margin-top-bottom-15px u-padding-10px"
                spacing={2}
              >
                <Grid item>
                  <Paper
                    elevation={3}
                    className="u-padding-16px u-center-horizontally u-max-width-450px u-min-width-450px"
                  >
                    <div className="u-center-horizontally u-margin-bottom-10px">
                      <Typography
                        variant="h3"
                        className="u-bold u-text-align-center"
                      >
                        <FontAwesomeIcon icon={faIdCard} /> {Messages.Profile}
                      </Typography>
                    </div>
                  </Paper>
                </Grid>

                <AppBar
                  position="static"
                  color="default"
                  className="u-margin-top-bottom-15px"
                >
                  <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    aria-label="simple tabs example"
                  >
                    <Tab label="Саморазвитие" />
                    <Tab label="Свидания (Второй этап)" />
                  </Tabs>
                </AppBar>

                <FirstStageProfile
                  readonly={readonly}
                  values={values}
                  showAnalysis={showAnalysis}
                />

                {secondStageEnabled && (
                  <SecondStageProfile
                    nameAdjuster={nameAdjuster}
                    initialValues={values.secondStageData}
                  />
                )}

                <ControlButtons
                  classes={classes}
                  readonly={readonly}
                  showAnalysis={showAnalysis}
                  setShowAnalysis={setShowAnalysis}
                  openMenu={openMenu}
                  saving={saving}
                  pristine={pristine}
                />

                {!readonly && (
                  <EllipsisMenu
                    values={values}
                    anchorEl={anchorEl}
                    menuIsOpen={menuIsOpen}
                    closeMenu={closeMenu}
                    showDialog={showDialog}
                  />
                )}
              </Grid>
            </form>
          );
        }}
      />
      {dialog}
    </>
  );
};
