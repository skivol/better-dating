import {
    Grid,
    Paper,
    InputAdornment
} from '@material-ui/core';
import { TextField } from 'mui-rff';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignature } from '@fortawesome/free-solid-svg-icons';
import { required } from '../../utils';
import * as Messages from '../Messages';

export const Nickname = ({ readonly }: any) => (
    <Grid item>
        <Paper elevation={3} className="u-padding-16px u-center-horizontally u-max-width-450px">
            <TextField
                required
                disabled={readonly}
                name="nickname"
                label={Messages.nickname}
                variant="outlined"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <FontAwesomeIcon icon={faSignature} size="lg" />
                        </InputAdornment>
                    ),
                }}
                inputProps={{
                    'aria-label': Messages.nickname
                }}
                fieldProps={{ validate: required }}
            />
        </Paper>
    </Grid>
);
