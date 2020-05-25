import * as React from "react";
import { FieldValidator } from 'final-form';
import {
    Grid,
    Paper,
    InputAdornment
} from '@material-ui/core';
import { TextField } from 'mui-rff';
import EmailIcon from '@material-ui/icons/Email';
import * as Messages from '../Messages';

interface Props {
    configuredEmailValidation: FieldValidator<string>;
}

/* Почта (для авторизации / обратной связи / организации свиданий) */
const Email = ({ configuredEmailValidation }: Props) => (

    <Grid item>
        <Paper elevation={3} className="u-padding-16px u-center-horizontally u-max-width-400px">
            <TextField
                required
                name="email"
                type="email"
                label={Messages.Email}
                variant="outlined"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <EmailIcon />
                        </InputAdornment>
                    ),
                }}
                inputProps={{
                    'aria-label': Messages.Email
                }}
                fieldProps={{ validate: configuredEmailValidation }}
            />
        </Paper>
    </Grid>
);

export default Email;
