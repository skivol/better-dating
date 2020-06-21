import * as React from "react";
import {
    Grid,
    Paper
} from '@material-ui/core';
import { Radios } from 'mui-rff';
import * as Messages from '../Messages';

const genderRadioData = [
    { label: Messages.female, value: 'female' },
    { label: Messages.male, value: 'male' },
];

// Пол (мужской / женский)
export const Gender = () => (
    <Grid item>
        <Paper elevation={3} className="u-padding-16px u-center-horizontally u-max-width-450px">
            <Radios
                required
                label={Messages.gender}
                name="gender"
                data={genderRadioData}
                radioGroupProps={{ row: true }}
                inputProps={{
                    'aria-label': Messages.gender
                }}
            />
        </Paper>
    </Grid >
);
