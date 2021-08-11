import * as React from "react";

import { useDispatch } from "react-redux";
import { format } from "date-fns";
import {
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  TextField,
} from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { showError, useForceUpdate } from "../../utils";
import * as Messages from "../Messages";

const accuracy = ({ coords: { accuracy } }: any) => accuracy;
const formatTime = (timestamp: number) =>
  format(new Date(timestamp), "HH:mm.ss");
const formatLocation = ({
  coords: { accuracy, latitude, longitude },
  timestamp,
}: any) => `
        широта: ${latitude},
        долгота: ${longitude},
        точность: ${accuracy},
        время: ${formatTime(timestamp)}
    `;
export const positionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 8000,
};

export const GeolocationDialog = ({ closeDialog }: any) => {
  const dispatch = useDispatch();
  const forceUpdate = useForceUpdate();

  const [currentPositionValue, setCurrentPositionValue] = React.useState<
    string | null
  >(null);

  const timeout = React.useRef<any>(null);
  const watchPositionId = React.useRef<any>(null);
  const locationsRef = React.useRef<Array<any>>([]);
  const locations = locationsRef.current;

  const clearWatchTimeout = React.useRef<any>(null);
  const clearWatch = React.useCallback(() => {
    if (watchPositionId.current) {
      navigator.geolocation.clearWatch(watchPositionId.current);
    }
  }, [watchPositionId.current]);

  React.useEffect(() => {
    refresh();
    return () => {
      clearWatch();
      clearTimeout(clearWatchTimeout.current);
    };
  }, []);

  const refresh = () => {
    clearWatch();
    clearTimeout(clearWatchTimeout.current);
    locationsRef.current = [];

    const showSnackbarError = () =>
      showError(dispatch, Messages.geolocationNeeded);
    if (!navigator.geolocation) {
      showSnackbarError();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position: any) => {
        setCurrentPositionValue(formatLocation(position));
      },
      showSnackbarError,
      positionOptions
    );
    watchPositionId.current = navigator.geolocation.watchPosition(
      (position: any) => {
        locationsRef.current = [...locationsRef.current, position];
        forceUpdate();
      },
      showSnackbarError,
      positionOptions
    );
    clearWatchTimeout.current = setTimeout(
      clearWatch,
      timeout.current || 10000
    );
  };

  const bestWatched =
    locations.length > 0
      ? locations.reduce((acc, curr) => {
          if (accuracy(acc) < accuracy(curr)) return acc;
          else return curr;
        })
      : null;

  return (
    <Dialog open onClose={closeDialog} scroll="body">
      <DialogContent dividers={false}>
        <ol>
          <li>
            <b>getCurrentPosition</b>
            {currentPositionValue}
          </li>
          <li>
            <b>watchPosition</b>
            {bestWatched && formatLocation(bestWatched)}
            <br />
            {bestWatched &&
              `${locations.indexOf(bestWatched) + 1} из ${locations.length}`}
            <br />
            {locations.length > 0 &&
              `от ${formatTime(locations[0].timestamp)} до ${formatTime(
                locations[locations.length - 1].timestamp
              )}`}
          </li>
        </ol>
      </DialogContent>
      <DialogActions>
        <Grid
          direction="column"
          container
          spacing={1}
          alignContent="center"
          className="u-margin-bottom-10px"
        >
          <Grid item>
            <TextField
              name="timeout"
              label={Messages.timeout}
              helperText={Messages.timeoutHelperText}
              variant="outlined"
              datatype="number"
              onChange={(e) => (timeout.current = e.target.value)}
            />
          </Grid>
          <Grid item style={{ margin: "auto" }}>
            <Button
              onClick={refresh}
              variant="contained"
              startIcon={<FontAwesomeIcon icon={faSyncAlt} />}
            >
              {Messages.refresh}
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};
