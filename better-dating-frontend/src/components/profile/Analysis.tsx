import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { subYears, isAfter } from 'date-fns';
import {
    Grid,
    Typography,
    Paper,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { Recurrence } from '../../utils/RecurrenceUtils';
import * as Messages from './Messages';
import * as ComponentsMessages from '../Messages';

const calculateBmi = (height: number, weight: number): { bmi: number, message: string, range: string, severity: "success" | "warning"} => {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const categories = [ // https://ru.wikipedia.org/wiki/Индекс_массы_тела  https://www.bmi.name/ru/
        // https://en.wikipedia.org/wiki/Body_mass_index#Categories
        { category: 1, range: 'x <= 16', key: 'massDeficiency', message: Messages.massDeficiency },
        { category: 2, range: '16 < x <= 18.5', key: 'underWeight', message: Messages.underWeight },
        { category: 3, range: '18.5 < x <= 25', key: 'normal', message: Messages.normal },
        { category: 4, range: '25 < x <= 30', key: 'preOverweight', message: Messages.preOverweight },
        { category: 5, range: '30 < x <= 35', key: 'overweight', message: Messages.overweight },
        { category: 6, range: '35 < x <= 40', key: 'severeOverweight', message: Messages.severeOverweight },
        { category: 7, range: '40 < x', key: 'verySevereOverweight', message: Messages.verySevereOverweight }
    ];
    const getCategory = () => {
        if (bmi <= 16) {
            return 1;
        } else if (bmi <= 18.5) {
            return 2;
        } else if (bmi <= 25) {
            return 3;
        } else if (bmi <= 30) {
            return 4;
        } else if (bmi <= 35) {
            return 5;
        } else if (bmi <= 40) {
            return 6;
        } else if (bmi > 40) {
            return 7;
        }
    };
    const { category, message, range } = categories.find(c => c.category === getCategory())!!;
    const severity = category === 3 ? "success" : "warning";
    return { bmi, message, range, severity };
};

const analyzeBmi = (birthday: Date, height: number, weight: number) => {
    const { bmi, message, range, severity } = calculateBmi(height, weight);
    const youngerThan20 = isAfter(birthday, subYears(new Date(), 20));
    return (
        <>
            <Alert severity={severity} className="u-margin-bottom-10px">
                <ReactMarkdown source={Messages.bodyMassIndexInfo(bmi.toFixed(2), message, range)} />
            </Alert>
            {youngerThan20 && <Alert severity="warning" className="u-margin-bottom-10px">{Messages.youngerThan20}</Alert>}
            <Alert severity="info" variant="outlined" className="u-margin-bottom-10px">
                <ReactMarkdown source={Messages.bmiMotivation} />
            </Alert>
            <Alert severity="success" variant="outlined">
                <ReactMarkdown source={Messages.someProsOfKeepingGoodWeight} />
            </Alert>
        </>
    );
};

const goodHabitSeverity = (recurrence: Recurrence) => (
    ["coupleTimesInWeek", "everyDay", "severalTimesInDay"].includes(recurrence) ? "success" : "warning"
);
const badHabitSeverity = (recurrence: Recurrence) => (
    ["neverDidAndNotGoingInFuture", "didBeforeNotGoingInFuture"].includes(recurrence) ? "success" : "warning"
);
const neutralHabitSeverity = (recurrence: Recurrence) => (
    ["everyDay", "severalTimesInDay"].includes(recurrence) ? "warning" : "success"
);

const analyzePhysicalExercise = (physicalExerciseRecurrence: Recurrence) => {
    const severity = goodHabitSeverity(physicalExerciseRecurrence);
    return (
        <>
            <Alert severity={severity} className="u-margin-bottom-10px">
                {Messages.physicalExerciseRecommendation}
            </Alert>
            <Alert severity="info" variant="outlined" className="u-margin-bottom-10px">
                <ReactMarkdown source={Messages.physicalExerciseInfo} />
            </Alert>
            <Alert severity="success" variant="outlined">
                <ReactMarkdown source={Messages.someProsOfKeepingGoodPhysicalShape} />
            </Alert>
        </>
    );
};

const analyzeSmoking = (smoking: Recurrence) => {
    const severity = badHabitSeverity(smoking);
    return (
        <>
            <Alert severity={severity} className="u-margin-bottom-10px">
                {Messages.smokingWarning}
            </Alert>
            <Alert severity="info" variant="outlined">
                <ReactMarkdown source={Messages.smokingInfo} />
            </Alert>
        </>
    )
};

const analyzeAlcohol = (alcohol: Recurrence) => {
    const severity = badHabitSeverity(alcohol);
    return (
        <>
            <Alert severity={severity} className="u-margin-bottom-10px">
                {Messages.alcoholWarning}
            </Alert>
            <Alert severity="info" variant="outlined">
                <ReactMarkdown source={Messages.alcoholInfo} />
            </Alert>
        </>
    )
};

const analyzeComputerGames = (computerGames: Recurrence) => {
    const severity = neutralHabitSeverity(computerGames);
    return (
        <>
            <Alert severity={severity} className="u-margin-bottom-10px">
                {Messages.computerGamesWarning}
            </Alert>
            <Alert severity="info" variant="outlined">
                <ReactMarkdown source={Messages.computerGamesInfo} />
            </Alert>
        </>
    )
};

const analyzeGambling = (gambling: Recurrence) => {
    const severity = badHabitSeverity(gambling);
    return (
        <>
            <Alert severity={severity} className="u-margin-bottom-10px">
                {Messages.gamblingWarning}
            </Alert>
        </>
    )
};

const analyzeHaircut = (haircut: Recurrence) => {
    const severity = badHabitSeverity(haircut);
    return (
        <>
            <Alert severity={severity} className="u-margin-bottom-10px">
                {Messages.haircutWarning}
            </Alert>
            <Alert severity="info" variant="outlined">
                <ReactMarkdown source={Messages.haircutInfo} />
            </Alert>
        </>
    )
};

const analyzeHairColoring = (hairColoring: Recurrence) => {
    const severity = badHabitSeverity(hairColoring);
    return (
        <>
            <Alert severity={severity} className="u-margin-bottom-10px">
                {Messages.hairColoringWarning}
            </Alert>
            <Alert severity="info" variant="outlined">
                {Messages.hairColoringInfo}
            </Alert>
        </>
    )
};

const analyzeMakeup = (makeup: Recurrence) => {
    const severity = neutralHabitSeverity(makeup);
    return (
        <>
            <Alert severity={severity} className="u-margin-bottom-10px">
                <ReactMarkdown source={Messages.makeupWarning} />
            </Alert>
            <Alert severity="info" variant="outlined">
                <ReactMarkdown source={Messages.makeupInfo} />
            </Alert>
        </>
    );
};

const analyzeIntimateRelationsOutsideOfMarriage = (intimateRelationsOutsideOfMarriage: Recurrence) => {
    const severity = badHabitSeverity(intimateRelationsOutsideOfMarriage);
    return (
        <>
            <Alert severity={severity} className="u-margin-bottom-10px">
                {Messages.intimateRelationsOutsideOfMarriageWarning}
            </Alert>
            <Alert severity="info" variant="outlined">
                <ReactMarkdown source={Messages.intimateRelationsOutsideOfMarriageInfo} />
            </Alert>
        </>
    );
};

const analyzePornographyWatching = (pornographyWatching: Recurrence) => {
    const severity = badHabitSeverity(pornographyWatching);
    return (
        <>
            <Alert severity={severity} className="u-margin-bottom-10px">
                {Messages.pornographyWatchingWarning}
            </Alert>
            <Alert severity="info" variant="outlined">
                <ReactMarkdown source={Messages.pornographyWatchingInfo} />
            </Alert>
        </>
    )
};

const analyzeSummary = (values: any) => {
    const {
        height, weight, physicalExercise, smoking, alcohol,
        computerGames, gambling, haircut, hairColoring,
        makeup, intimateRelationsOutsideOfMarriage, pornographyWatching
    } = values;
    const bmiSeverity = calculateBmi(height, weight).severity;
    const physicalExerciseSeverity = goodHabitSeverity(physicalExercise);
    const smokingSeverity = badHabitSeverity(smoking);
    const alcoholSeverity = badHabitSeverity(alcohol);
    const computerGamesSeverity = neutralHabitSeverity(computerGames);
    const gamblingSeverity = badHabitSeverity(gambling);
    const haircutSeverity = badHabitSeverity(haircut);
    const hairColoringSeverity = badHabitSeverity(hairColoring);
    const makeupSeverity = neutralHabitSeverity(makeup);
    const intimateRelationsOutsideOfMarriageSeverity = badHabitSeverity(intimateRelationsOutsideOfMarriage);
    const pornographyWatchingSeverity = badHabitSeverity(pornographyWatching);
    const severity = [
        bmiSeverity, physicalExerciseSeverity, smokingSeverity, alcoholSeverity,
        computerGamesSeverity, gamblingSeverity, makeupSeverity, intimateRelationsOutsideOfMarriageSeverity,
        pornographyWatchingSeverity
    ].filter(s => s === 'warning').length > 0 ? 'warning' : 'success';

    return (
        <>
            <Typography variant="h5">{Messages.results}</Typography>
            <Alert severity={severity} className="u-margin-bottom-10px">
                {severity === 'success' ? Messages.starProfile : Messages.goodProfileButCanBeImproved}
            </Alert>
            <Alert severity={bmiSeverity} variant="outlined" className="u-margin-bottom-5px">{ComponentsMessages.weight}</Alert>
            <Alert severity={physicalExerciseSeverity} variant="outlined" className="u-margin-bottom-5px">{ComponentsMessages.physicalExercise}</Alert>
            <Alert severity={smokingSeverity} variant="outlined" className="u-margin-bottom-5px">{ComponentsMessages.smoking}</Alert>
            <Alert severity={alcoholSeverity} variant="outlined" className="u-margin-bottom-5px">{ComponentsMessages.alcohol}</Alert>
            <Alert severity={computerGamesSeverity} variant="outlined" className="u-margin-bottom-5px">{ComponentsMessages.computerGames}</Alert>
            <Alert severity={gamblingSeverity} variant="outlined" className="u-margin-bottom-5px">{ComponentsMessages.gambling}</Alert>
            <Alert severity={haircutSeverity} variant="outlined" className="u-margin-bottom-5px">{ComponentsMessages.haircut}</Alert>
            <Alert severity={hairColoringSeverity} variant="outlined" className="u-margin-bottom-5px">{ComponentsMessages.hairColoring}</Alert>
            <Alert severity={makeupSeverity} variant="outlined" className="u-margin-bottom-5px">{ComponentsMessages.makeup}</Alert>
            <Alert severity={intimateRelationsOutsideOfMarriageSeverity} variant="outlined" className="u-margin-bottom-5px">{ComponentsMessages.intimateRelationsOutsideOfMarriage}</Alert>
            <Alert severity={pornographyWatchingSeverity} variant="outlined" className="u-margin-bottom-5px">{ComponentsMessages.pornographyWatching}</Alert>
        </>
    );
};

export const analyze = (type: string, values: any) => {
    let analysisResult = null;

    if (type === 'height-weight') {
        const { bday, height, weight } = values;
        analysisResult = analyzeBmi(bday, height, weight);
    } else if (type === 'physicalExercise') {
        const { physicalExercise } = values;
        analysisResult = analyzePhysicalExercise(physicalExercise);
    } else if (type === 'smoking') {
        const { smoking } = values;
        analysisResult = analyzeSmoking(smoking);
    } else if (type === 'alcohol') {
        const { alcohol } = values;
        analysisResult = analyzeAlcohol(alcohol);
    } else if (type === 'computerGames') {
        const { computerGames } = values;
        analysisResult = analyzeComputerGames(computerGames);
    } else if (type === 'gambling') {
        const { gambling } = values;
        analysisResult = analyzeGambling(gambling);
    } else if (type === 'haircut') {
        const { haircut } = values;
        analysisResult = analyzeHaircut(haircut);
    } else if (type === 'hairColoring') {
        const { hairColoring } = values;
        analysisResult = analyzeHairColoring(hairColoring);
    } else if (type === 'makeup') {
        const { makeup } = values;
        analysisResult = analyzeMakeup(makeup);
    } else if (type === 'intimateRelationsOutsideOfMarriage') {
        const { intimateRelationsOutsideOfMarriage } = values;
        analysisResult = analyzeIntimateRelationsOutsideOfMarriage(intimateRelationsOutsideOfMarriage);
    } else if (type === 'pornographyWatching') {
        const { pornographyWatching } = values;
        analysisResult = analyzePornographyWatching(pornographyWatching);
    } else if (type === 'summary') {
        analysisResult = analyzeSummary(values);
    }

    return (
        <Grid item>
            <Paper elevation={3} className="u-padding-10px">
                {analysisResult}
            </Paper>
        </Grid>
    );
}
