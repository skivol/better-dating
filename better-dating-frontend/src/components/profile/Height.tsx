import * as React from "react";
import { TextField } from 'mui-rff';
import {
    Grid,
    Paper,
    InputAdornment
} from '@material-ui/core';
import { validateHeight } from '../../utils/ValidationUtils';
import * as Messages from '../Messages';

// Рост (см)
export const Height = () => (
    <Grid item>
        <Paper elevation={3} className="u-padding-16px u-center-horizontally u-max-width-450px">
            <TextField
                required
                name="height"
                label={Messages.height}
                variant="outlined"
                type="number"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            {Messages.cm}
                        </InputAdornment>
                    )
                }}
                inputProps={{
                    'aria-label': Messages.height
                }}
                fieldProps={{ validate: validateHeight }}
            />
        </Paper>
    </Grid>
);
