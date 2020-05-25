import * as React from "react";
import { Select } from 'mui-rff';
import {
    Grid,
    Paper
} from '@material-ui/core';
import {
    physicalExerciseOptions,
    smokingOptions,
    alcoholOptions,
    computerGamesOptions,
    gamblingOptions,
    haircutOptions,
    hairColoringOptions,
    makeupOptions,
    intimateRelationsOutsideOfMarriageOptions,
    pornographyWatchingOptions
} from '../../utils/RecurrenceUtils';
import { required } from '../../utils/ValidationUtils';
import * as Messages from '../Messages';


const actions = [{ /* Физкультура / физические упражнения */
    validate: required,
    required: true,
    name: "physicalExercise",
    label: Messages.physicalExercise,
    data: physicalExerciseOptions
}, { /* Курение и его разновидности (сигареты, вайп, снус, кальян) (частота) */
    validate: required,
    required: true,
    name: "smoking",
    label: Messages.smoking,
    data: smokingOptions,
    helperText: Messages.smokingInfo
}, { /* Алкоголь */
    validate: required,
    required: true,
    name: "alcohol",
    label: Messages.alcohol,
    data: alcoholOptions
}, { /* Компьютерные игры */
    validate: required,
    required: true,
    name: "computerGames",
    label: Messages.computerGames,
    data: computerGamesOptions
}, { /* Азартные игры */
    validate: required,
    required: true,
    name: "gambling",
    label: Messages.gambling,
    data: gamblingOptions,
    helperText: Messages.gamblingInfo
}, { /* Стрижка */
    validate: required,
    required: true,
    name: "haircut",
    label: Messages.haircut,
    data: haircutOptions
}, { /* Окрашивание волос */
    validate: required,
    required: true,
    name: "hairColoring",
    label: Messages.hairColoring,
    data: hairColoringOptions
}, { /* Макияж */
    validate: required,
    required: true,
    name: "makeup",
    label: Messages.makeup,
    data: makeupOptions
}, { /* Интимные отношения (телегония) */
    name: "intimateRelationsOutsideOfMarriage",
    label: Messages.intimateRelationsOutsideOfMarriage,
    data: intimateRelationsOutsideOfMarriageOptions
}, { /* Просмотр порнографии */
    name: "pornographyWatching",
    label: Messages.pornographyWatching,
    data: pornographyWatchingOptions
}];

const actionSelect = ({ validate, required, name, label, data, helperText }: any) => (
    <Grid item key={name}>
        <Paper elevation={3} className="u-padding-16px u-center-horizontally u-max-width-400px">
            <Select
                required={required}
                fieldProps={{ validate }}
                name={name}
                label={label}
                data={data}
                helperText={helperText}
            />
        </Paper>
    </Grid>
);

export const renderActions = () => actions.map(actionSelect);
