import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { FormApi } from "final-form";
import { Form } from "react-final-form";
import {
  Grid,
  Typography,
  Paper,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@material-ui/core";
import { ToggleButton } from "@material-ui/lab";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faUserCheck,
  faLevelUpAlt,
  faUserMinus,
  faEllipsisV,
  faIdCard,
  faBinoculars,
} from "@fortawesome/free-solid-svg-icons";

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
  Email,
  Nickname,
  Gender,
  Birthday,
  Height,
  Weight,
  AnalyzedSection,
  PersonalHealthEvaluation,
  renderActions,
  AccountRemovalConfirm,
  ViewOtherUserProfileConfirm,
  SecondStageEnableDialog,
} from "./profile";

import { SpinnerAdornment } from "./common";

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

  return (
    <>
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        render={({ handleSubmit, values, pristine }) => {
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
                {!readonly && <Email />}
                <Nickname readonly={readonly} />
                <Gender readonly={readonly} />
                <Birthday id="birthday" readonly={readonly} />

                <AnalyzedSection
                  id="height-weight-analyze"
                  type="height-weight"
                  values={values}
                  visible={showAnalysis}
                >
                  <Height readonly={readonly} />
                  <Weight readonly={readonly} />
                </AnalyzedSection>

                {renderActions(values, showAnalysis, readonly)}
                <AnalyzedSection
                  type="summary"
                  values={values}
                  visible={showAnalysis}
                >
                  <PersonalHealthEvaluation readonly={readonly} />
                </AnalyzedSection>

                <ButtonGroup
                  variant="contained"
                  size="large"
                  className={`${classes.button} u-center-horizontally`}
                >
                  {!readonly && (
                    <Button
                      color="primary"
                      type="submit"
                      disabled={pristine || saving}
                      startIcon={
                        saving ? (
                          <SpinnerAdornment />
                        ) : (
                          <FontAwesomeIcon icon={faSave} />
                        )
                      }
                    >
                      {Messages.save}
                    </Button>
                  )}
                  <ToggleButton
                    className="u-color-green"
                    selected={showAnalysis}
                    value="analyze"
                    onChange={() => setShowAnalysis(!showAnalysis)}
                  >
                    <FontAwesomeIcon
                      className={`${classes.icon} MuiButton-startIcon`}
                      icon={faUserCheck}
                    />
                    {showAnalysis ? Messages.hideAnalysis : Messages.analyze}
                  </ToggleButton>
                  {!readonly && (
                    <Button className="u-color-black" onClick={openMenu}>
                      <FontAwesomeIcon
                        className="MuiButton-startIcon"
                        icon={faEllipsisV}
                        size="lg"
                      />
                    </Button>
                  )}
                </ButtonGroup>
                {!readonly && (
                  <Menu
                    id="menu-profile-extra"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={menuIsOpen}
                    onClose={closeMenu}
                  >
                    <Tooltip
                      arrow
                      title={
                        values.eligibleForSecondStage
                          ? ""
                          : Messages.nonEligibleForSecondStageReason
                      }
                      placement="top"
                    >
                      <span>
                        <MenuItem
                          onClick={() => showDialog("enableSecondStage")}
                          disabled={!values.eligibleForSecondStage}
                        >
                          <ListItemIcon className="u-color-green u-min-width-30px">
                            <FontAwesomeIcon
                              className="MuiButton-startIcon"
                              icon={faLevelUpAlt}
                            />
                          </ListItemIcon>
                          <ListItemText className="u-color-green">
                            {Messages.nextLevel}
                          </ListItemText>
                        </MenuItem>
                      </span>
                    </Tooltip>
                    <MenuItem onClick={() => showDialog("accountRemoval")}>
                      <ListItemIcon className="u-color-red u-min-width-30px">
                        <FontAwesomeIcon
                          className="MuiButton-startIcon"
                          icon={faUserMinus}
                        />
                      </ListItemIcon>
                      <ListItemText className="u-color-red">
                        {Messages.removeProfile}
                      </ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => showDialog("viewAuthorsProfile")}>
                      <ListItemIcon className="u-min-width-30px">
                        <FontAwesomeIcon
                          className="MuiButton-startIcon"
                          icon={faBinoculars}
                        />
                      </ListItemIcon>
                      <ListItemText>{Messages.viewAuthorsProfile}</ListItemText>
                    </MenuItem>
                  </Menu>
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
