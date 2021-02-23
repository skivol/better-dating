import { Grid, Paper } from "@material-ui/core";

export const PaperGrid = ({ children, elevation = 3 }: any) => (
  <Grid item>
    <Paper
      elevation={elevation}
      className="u-padding-16px u-center-horizontally u-max-width-500px"
    >
      {children}
    </Paper>
  </Grid>
);
