import * as React from "react";
import {
    Grid,
    Typography,
    Paper,
    Box
} from '@material-ui/core';
import { Alert, Rating } from '@material-ui/lab';
import * as Messages from '../Messages';

const personalHealthEvaluationLabels: { [index: string]: string } = {
    1: 'Ужасное',
    2: 'Так себе',
    3: 'Слабое',
    4: 'Ничего',
    5: 'Нормальное',
    6: 'Выше среднего',
    7: 'Хорошее',
    8: 'Хорошее+',
    9: 'Замечательное',
    10: 'Лучше некуда',
};

export default function RatingAdapter({ input: { value, ...inputRest }, meta, label, ...rest }: any) {
    const [hoverValue, setHover] = React.useState(-1);
    const error = meta.touched && meta.error;
    const errorText = error ? ` (${meta.error})` : '';
    return (
        <Grid item>
            <Paper elevation={3} className="u-padding-16px u-center-horizontally u-max-width-400px">
                <Typography color={error ? "error" : undefined}>{`${label} * ${errorText}`}</Typography>
                <div className="u-center-flex u-margin-bottom-10px">
                    <Rating
                        precision={1}
                        max={10}
                        size="medium"
                        onChangeActive={(event, newHover) => setHover(newHover)}
                        value={value}
                        {...rest}
                        {...inputRest}
                    />
                    {value !== null && (
                        <Box ml={2}>
                            {personalHealthEvaluationLabels[hoverValue !== -1 ? hoverValue : value]}
                        </Box>
                    )}
                </div>
                <Alert variant="outlined" severity="info">
                    {Messages.personalHealthEvaluationCriteria}
                </Alert>
            </Paper>
        </Grid>
    );
}
