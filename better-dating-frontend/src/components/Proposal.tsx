import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import {
  Grid,
  Paper,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Divider,
  Button,
  Dialog,
  CardMedia,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faVk } from "@fortawesome/free-brands-svg-icons";

import { getData, ReactMarkdownMaterialUi } from "../utils";
import { updated } from "../constants";
import * as Messages from "./Messages";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    heading: {
      fontSize: theme.typography.pxToRem(15),
    },
    button: {
      margin: theme.spacing(1),
    },
  })
);

const onContactRequest = async () => {
  const { link } = await getData("/api/user/email/contact");
  window.location.href = atob(link);
};

const DialogWithFirstStageFlowImage = (handleClose: () => void) => (
  <Dialog open onClose={handleClose} aria-labelledby="max-width-dialog-title">
    <img
      src="/img/Первый_этап.png"
      alt={Messages.firstStageFlowAlt}
      className="c-first-stage-flow-image"
    />
  </Dialog>
);

export const Proposal = () => {
  const classes = useStyles();
  const [dialog, setDialog] = useState<any>(null);
  const closeDialog = () => setDialog(null);
  const openDialog = () =>
    setDialog(DialogWithFirstStageFlowImage(closeDialog));

  return (
    <>
      <Paper className="u-padding-25px">
        <Grid container justifyContent="center" spacing={3}>
          <Grid item>
            <Typography variant="h5" className="u-text-align-center">
              {Messages.description}
            </Typography>
          </Grid>
          <Grid container justifyContent="center" spacing={3}>
            <Grid item>
              <Image
                src="/img/self-development-stage.svg"
                alt={Messages.selfDevelopment}
                width={100}
                height={92.36}
              />
            </Grid>
            <Grid item>
              <Image
                src="/img/dating-stage.svg"
                alt={Messages.dating}
                width={100}
                height={92.36}
              />
            </Grid>
            <Grid item>
              <Image
                src="/img/family-stage.svg"
                alt={Messages.family}
                width={100}
                height={92.36}
              />
            </Grid>
          </Grid>
          <Grid container justifyContent="center">
            <Grid
              item
              style={{
                border: "1px solid gray",
                borderRadius: "10px",
                padding: "0 10px 10px 0",
                marginTop: "10px",
              }}
            >
              <ReactMarkdownMaterialUi className="u-max-width-400px">
                {Messages.flowDescription}
              </ReactMarkdownMaterialUi>
            </Grid>
          </Grid>
          <Grid item>
            <Alert
              severity="success"
              variant="filled"
              className="u-max-width-400px"
            >
              {Messages.developmentStatus}
            </Alert>
          </Grid>
        </Grid>
      </Paper>

      <Grid
        container
        direction="column"
        className="u-margin-top-bottom-15px u-min-width-300px u-padding-10px"
      >
        <Grid item>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={clsx("c-heading", classes.heading)}>
                {Messages.Idea}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container direction="column">
                <Grid item>
                  <Typography>{Messages.FirstStage}</Typography>
                  <Divider className="u-margin-10px" />
                </Grid>
                <Grid item>
                  <CardMedia
                    src="/img/Первый_этап.png"
                    component="img"
                    alt={Messages.firstStageFlowAlt}
                    onClick={openDialog}
                  />
                </Grid>
                <Grid item>
                  <Typography>{Messages.FirstStageFirstStep}</Typography>
                  <Divider className="u-margin-10px" />
                  <Typography>{Messages.FirstStageSecondStep}</Typography>
                  <Divider className="u-margin-10px" />
                  <Typography>{Messages.FirstStageThirdStep}</Typography>
                  <Divider className="u-margin-10px" />
                  <Typography>{Messages.FirstStageFourthStep}</Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={clsx("c-heading", classes.heading)}>
                {Messages.CurrentImplementation}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ReactMarkdownMaterialUi>
                {Messages.currentImplementationDetails}
              </ReactMarkdownMaterialUi>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={classes.heading}>
                {Messages.AreDatingSitesNeeded}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container direction="column">
                <Grid item>
                  <Typography>{Messages.MotivationOfNeedTitle}</Typography>
                </Grid>
                <Grid item>
                  <ul>
                    <li>{Messages.explicitIntention}</li>
                    <li>{Messages.motivateSelfImprovement}</li>
                  </ul>
                </Grid>
                <Grid item>
                  <Typography>
                    {Messages.WhyNot}
                    <span aria-label="smiley" role="img">
                      😊
                    </span>
                    .
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={classes.heading}>
                {Messages.AnotherDatingSite}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container direction="column">
                <Typography>{Messages.YesOneOfGoalsIsDating}</Typography>
                <Divider className="u-margin-10px" />
                <Typography>{Messages.ButThereAreDifferences}</Typography>
                <ul>
                  <li>{Messages.onlyActiveParticipants}</li>
                  <li>{Messages.moreInvolvedSystem}</li>
                  <li>{Messages.feedbackSystem}</li>
                  <li>{Messages.fullFeaturedForFree}</li>
                </ul>
                <Divider className="u-margin-10px" />
                <Typography>{Messages.AboutSmotrinyRu}</Typography>
                <Divider className="u-margin-10px" />
                <Typography>{Messages.OtherAlternatives}</Typography>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item>
          <Paper
            elevation={3}
            className="u-max-width-650px u-center-horizontally"
          >
            <Grid
              container
              direction="row"
              wrap="nowrap"
              className="u-padding-10px u-margin-10px"
            >
              <Grid item xs={1} className="u-center-flex u-right-margin-10px">
                <FontAwesomeIcon
                  color="red"
                  size="2x"
                  icon={faExclamationCircle}
                />
              </Grid>
              <Grid item xs={10}>
                <div className="MuiTypography-root MuiTypography-body1">
                  <ReactMarkdownMaterialUi>
                    {Messages.spreadTheWordIfSeemsInteresting}
                  </ReactMarkdownMaterialUi>
                </div>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item className="u-margin-bottom-10px">
          <Paper className="u-max-width-650px u-center-horizontally">
            <Grid
              container
              direction="row"
              className="u-padding-10px u-margin-10px"
            >
              <Grid item xs={6} className="u-center-flex">
                <Typography className="u-075-fontsize">
                  {Messages.contactUs}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                {/* https://www.ionos.com/digitalguide/e-mail/e-mail-security/protecting-your-email-address-how-to-do-it/ */}
                {/* https://www.quora.com/Should-you-pass-an-email-address-in-a-url */}
                <Button
                  variant="outlined"
                  onClick={onContactRequest}
                  className={classes.button}
                >
                  {Messages.contactUsButton}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Paper className="u-max-width-650px u-center-horizontally">
          <Grid
            container
            justifyContent="center"
            spacing={1}
            className="u-padding-10px"
          >
            <Grid item>
              <Button
                href="https://www.facebook.com/Смотриныукр-Смотринырус-112219810635447"
                variant="text"
                color="primary"
                startIcon={<FontAwesomeIcon icon={faFacebook} />}
              >
                <Typography>{Messages.pageInFacebook}</Typography>
              </Button>
            </Grid>
            <Grid item>
              <Button
                href="https://vk.com/public198979643"
                variant="text"
                color="default"
                startIcon={<FontAwesomeIcon icon={faVk} />}
              >
                <Typography>{Messages.pageInVk}</Typography>
              </Button>
            </Grid>
          </Grid>
        </Paper>
        {dialog}
      </Grid>
      <Paper className="c-updated-time-paper u-center-horizontally">
        <Typography className="u-075-fontsize">
          {`${Messages.updated}: ${updated}`}
        </Typography>
      </Paper>
    </>
  );
};

export default Proposal;
