import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { KeyboardDatePicker } from "mui-rff";

import { ru } from "date-fns/locale";
import DateFnsUtils from "@date-io/date-fns";

import { validateBirthday } from "../../utils/ValidationUtils";
import { PaperGrid } from "../common";
import * as Messages from "../Messages";

const currentDateLocale = ru;

// Дата рождения (год-месяц-день)
export const Birthday = ({ id = "birthday", readonly }: any) => (
  <PaperGrid>
    <MuiPickersUtilsProvider locale={currentDateLocale} utils={DateFnsUtils}>
      <KeyboardDatePicker
        id={id}
        disabled={readonly}
        required
        disableToolbar
        disableFuture
        format="yyyy-MM-dd"
        name="bday"
        inputVariant="outlined"
        label={Messages.birthday}
        cancelLabel={Messages.cancel}
        inputProps={{
          "aria-label": Messages.birthday,
        }}
        fieldProps={{ validate: validateBirthday }}
      />
    </MuiPickersUtilsProvider>
  </PaperGrid>
);
