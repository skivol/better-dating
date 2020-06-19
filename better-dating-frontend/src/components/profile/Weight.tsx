import * as React from "react";
import { TextField } from 'mui-rff';
import {
    Grid,
    Paper,
    InputAdornment
} from '@material-ui/core';
import { validateWeight } from '../../utils/ValidationUtils';
import * as Messages from '../Messages';

// Вес (кг)
const Weight = () => (
    <Grid item>
        <Paper elevation={3} className="u-padding-16px u-center-horizontally u-max-width-400px">
            <TextField
                required
                name="weight"
                label={Messages.weight}
                variant="outlined"
                type="number"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            {Messages.kg}
                        </InputAdornment>
                    )
                }}
                inputProps={{
                    'aria-label': Messages.weight
                }}
                fieldProps={{ validate: validateWeight }}
            />
        </Paper>
    </Grid>
);

export default Weight;