import { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Typography, Grid } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTools,
  faMailBulk,
  faMapMarkedAlt,
} from "@fortawesome/free-solid-svg-icons";
import { showError, showSuccess, postData, useDialog } from "../utils";
import * as ActionMessages from "../actions/Messages";
import * as Messages from "./Messages";
import { SpinnerAdornment } from "./common";
import { GeolocationDialog, MapTest } from "./administration";
import "leaflet/dist/leaflet.css";

const Administration = ({ mapboxToken, usageStats }: any) => {
  const [sending, setSending] = useState(false);
  const dispatch = useDispatch();

  const onSendTestMail = async () => {
    setSending(true);
    postData("/api/admin/test-mail")
      .then(() => showSuccess(dispatch, Messages.testEmailWasSent))
      .catch(() => showError(dispatch, ActionMessages.oopsSomethingWentWrong))
      .finally(() => setSending(false));
  };

  const { dialogIsOpen, openDialog, closeDialog } = useDialog();

  return (
    <>
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
        spacing={2}
        className="u-margin-bottom-10px"
      >
        <Grid item>
          <Typography variant="h3" className="u-bold">
            <FontAwesomeIcon icon={faTools} /> {Messages.Administration}
          </Typography>
        </Grid>
        <Grid style={{ height: "16px" }}></Grid>
        <Grid item>
          <div className="u-text-align-center">
            {Messages.registeredNumber(usageStats.registered)}
          </div>
          <div className="u-text-align-center">
            {Messages.removedNumber(usageStats.removed)}
          </div>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={onSendTestMail}
            disabled={sending}
            startIcon={
              sending ? (
                <SpinnerAdornment />
              ) : (
                <FontAwesomeIcon icon={faMailBulk} />
              )
            }
          >
            {Messages.testEmail}
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => openDialog()}
            startIcon={<FontAwesomeIcon icon={faMapMarkedAlt} />}
          >
            {Messages.testGeolocation}
          </Button>
        </Grid>
        <Grid item>
          <Button href="https://account.mapbox.com/">
            <Typography>Mapbox (Tiling / Geocoding)</Typography>
          </Button>
        </Grid>
        <Grid item>
          <Button href="https://console.cloud.google.com/apis/credentials?authuser=1">
            <Typography>Google Cloud Platform (TimeZone API)</Typography>
          </Button>
        </Grid>
      </Grid>
      <MapTest mapboxToken={mapboxToken} />
      {dialogIsOpen && <GeolocationDialog closeDialog={closeDialog} />}
    </>
  );
};

export default Administration;
