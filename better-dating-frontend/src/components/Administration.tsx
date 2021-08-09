import * as React from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { formatISO } from "date-fns";
import { Button, Typography } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTools,
  faMailBulk,
  faMapMarkedAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  getData,
  unauthorized,
  showError,
  showSuccess,
  postData,
} from "../utils";
import * as ActionMessages from "../actions/Messages";
import * as Messages from "./Messages";
import { CenteredSpinner, SpinnerAdornment } from "./common";

const Administration = () => {
  const [usageStats, setUsageStats] = React.useState<any>(null);
  const [sending, setSending] = React.useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  React.useEffect(() => {
    getData("/api/admin/usage-stats")
      .then(setUsageStats)
      .catch((e) => {
        const isUnauthorized = unauthorized(e);
        const message = isUnauthorized
          ? Messages.unauthorized
          : ActionMessages.oopsSomethingWentWrong;
        showError(dispatch, message);
        isUnauthorized && router.push("/");
      });
  }, []);

  const onSendTestMail = async () => {
    setSending(true);
    postData("/api/admin/test-mail")
      .then(() => showSuccess(dispatch, Messages.testEmailWasSent))
      .catch((e) => {
        console.log({ e });
        showError(dispatch, ActionMessages.oopsSomethingWentWrong);
      })
      .finally(() => setSending(false));
  };

  const onTestGeolocation = () => {
    const showSnackbarError = () =>
      showError(dispatch, Messages.geolocationNeeded);
    if (!navigator.geolocation) {
      showSnackbarError();
      return;
    }
    const showGeolocation = (position: any) => {
      const {
        coords: { accuracy, latitude, longitude },
        timestamp,
      } = position;
      alert(`
        широта: ${latitude},
        долгота: ${longitude},
        точность: ${accuracy},
        время: ${formatISO(new Date(timestamp))},
    `);
    };
    navigator.geolocation.getCurrentPosition(
      showGeolocation,
      showSnackbarError,
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  if (!usageStats) {
    return <CenteredSpinner />;
  }
  return (
    <>
      <div className="u-center-horizontally u-margin-bottom-10px">
        <Typography variant="h3" className="u-bold u-text-align-center">
          <FontAwesomeIcon icon={faTools} /> {Messages.Administration}
        </Typography>
      </div>
      <div className="u-padding-16px"></div>
      <div className="u-max-content u-center-horizontally">
        {Messages.registeredNumber(usageStats.registered)}
      </div>
      <div className="u-max-content u-center-horizontally u-margin-bottom-10px">
        {Messages.removedNumber(usageStats.removed)}
      </div>
      <div className="u-max-content u-center-horizontally u-margin-bottom-10px">
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
      </div>
      <div className="u-max-content u-center-horizontally">
        <Button
          variant="contained"
          color="secondary"
          onClick={onTestGeolocation}
          startIcon={<FontAwesomeIcon icon={faMapMarkedAlt} />}
        >
          {Messages.testGeolocation}
        </Button>
      </div>
    </>
  );
};

export default Administration;
