import * as React from "react";
import {
    Grid,
    Paper,
    InputAdornment
} from '@material-ui/core';
import { TextField } from 'mui-rff';
import EmailIcon from '@material-ui/icons/Email';
import * as Messages from '../Messages';
import { validateEmail } from '../../utils';

type Props = {
    label?: string;
};

/* Почта (для авторизации / обратной связи / организации свиданий) */
export const Email = ({ label = Messages.Email }: Props) => (
    <Grid item>
        <Paper elevation={3} className="u-padding-16px u-center-horizontally u-max-width-450px">
            <TextField
                required
                name="email"
                type="email"
                label={label}
                variant="outlined"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <EmailIcon />
                        </InputAdornment>
                    ),
                }}
                inputProps={{
                    'aria-label': label
                }}
                fieldProps={{ validate: validateEmail }}
            />
        </Paper>
    </Grid>
);
