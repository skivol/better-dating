import { Grid, Typography, Paper } from "@material-ui/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserFriends } from "@fortawesome/free-solid-svg-icons";

import { useUser, useForceUpdate } from "../utils";
import * as Messages from "./Messages";
import { SpinnerAdornment as Spinner } from "./common";
import { PairsAndDates } from "./dating";

type Props = {
  datingData: any;
};

export const Dating = ({ datingData }: Props) => {
  const forceUpdate = useForceUpdate();
  const pairById = (pairId: string) =>
    datingData.pairs.find((p: any) => p.datingPair.id === pairId);
  const dateById = (dateId: string) =>
    datingData.dates.find((d: any) => d.dateInfo.id === dateId);
  const dataUpdater = {
    setPairActive: (pairId: string, active: boolean) => {
      const pair = pairById(pairId);
      pair.datingPair.active = active;
      forceUpdate();
    },
    setDate: (dateId: string, dateUpdate: any, placeUpdate: any) => {
      const date = dateById(dateId);
      date.dateInfo = { ...date.dateInfo, ...dateUpdate };
      if (placeUpdate) {
        date.place = placeUpdate;
      }
      forceUpdate();
    },
    setCredibilityAndImprovement: (
      dateId: string,
      credibilityAndImprovement: any
    ) => {
      const { otherCredibility, otherImprovement } =
        credibilityAndImprovement || {};
      const date = dateById(dateId);
      date.otherCredibility = otherCredibility;
      date.otherImprovement = otherImprovement;
      forceUpdate();
    },
    setDecision: (pairId: string, pairDecision: any) => {
      const pair = pairById(pairId);
      pair.pairDecision = pairDecision;
      forceUpdate();
    },
  };

  const user = useUser();
  if (user.loading) {
    return <Spinner />;
  }

  return (
    <Grid
      container
      direction="column"
      className="u-margin-top-bottom-15px u-padding-10px"
      spacing={3}
    >
      <Grid item>
        <Paper elevation={3} className="u-padding-16px u-center-horizontally">
          <div className="u-center-horizontally u-margin-bottom-10px">
            <Typography variant="h3" className="u-bold u-text-align-center">
              <FontAwesomeIcon icon={faUserFriends} /> {Messages.PairsAndDates}
            </Typography>
          </div>
        </Paper>
      </Grid>
      <Grid container direction="column" spacing={2} className="u-padding-10px">
        <Paper className="u-padding-10px">
          <PairsAndDates
            datingData={datingData}
            user={user}
            dataUpdater={dataUpdater}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};
