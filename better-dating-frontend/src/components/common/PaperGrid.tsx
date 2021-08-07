import { Grid, Paper } from "@material-ui/core";

export const PaperGrid = ({
  children,
  elevation = 3,
  noMaxWidth = false,
}: any) => (
  <Grid item>
    <Paper
      elevation={elevation}
      className={`u-padding-16px u-center-horizontally ${
        noMaxWidth ? "" : "u-max-width-500px"
      }`}
    >
      {children}
    </Paper>
  </Grid>
);
