import * as React from 'react';
import { CircularProgress, Grid } from '@material-ui/core';

export const CenteredSpinner = () => (
    <Grid container justify="center">
        <Grid item>
            <CircularProgress />
        </Grid>
    </Grid>
);
