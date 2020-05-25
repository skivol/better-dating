import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { KeyboardDatePicker } from 'mui-rff';
import {
    Grid,
    Paper
} from '@material-ui/core';

import { ru } from 'date-fns/locale';
import DateFnsUtils from '@date-io/date-fns';

import { validateBirthday } from '../../utils/ValidationUtils';
import * as Messages from '../Messages';

const currentDateLocale = ru;

// Дата рождения (год-месяц-день)
const Birthday = () => (
    <Grid item>
        <Paper elevation={3} className="u-padding-16px u-center-horizontally u-max-width-400px">
            <MuiPickersUtilsProvider locale={currentDateLocale} utils={DateFnsUtils}>
                <KeyboardDatePicker
                    required
                    disableToolbar
                    disableFuture
                    format="yyyy-MM-dd"
                    name="bday"
                    inputVariant="outlined"
                    label={Messages.birthday}
                    cancelLabel={Messages.cancel}
                    inputProps={{
                        'aria-label': Messages.birthday
                    }}
                    fieldProps={{ validate: validateBirthday }}
                />
            </MuiPickersUtilsProvider>
        </Paper>
    </Grid>
);

export default Birthday;
