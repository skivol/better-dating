import {
    Grid,
    Paper,
    InputAdornment
} from '@material-ui/core';
import { TextField } from 'mui-rff';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import * as Messages from '../Messages';
import { validateEmail } from '../../utils';

type Props = {
    label?: string;
    elevation?: number;
};

/* Почта (для авторизации / обратной связи / организации свиданий) */
export const Email = ({ label = Messages.Email, elevation = 3 }: Props) => (
    <Grid item>
        <Paper elevation={elevation} className="u-padding-16px u-center-horizontally u-max-width-450px">
            <TextField
                required
                name="email"
                type="email"
                label={label}
                variant="outlined"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <FontAwesomeIcon icon={faEnvelope} size="lg" />
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
