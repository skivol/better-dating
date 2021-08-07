import { Grid, Typography, Paper } from "@material-ui/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserFriends } from "@fortawesome/free-solid-svg-icons";

import { useUser } from "../utils";
import * as Messages from "./Messages";
import { SpinnerAdornment as Spinner } from "./common";
import { PairsAndDates } from "./dating";

type Props = {
  datingData: any;
};

export const Dating = ({ datingData }: Props) => {
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
          <PairsAndDates datingData={datingData} user={user} />
        </Paper>
      </Grid>
    </Grid>
  );
};
