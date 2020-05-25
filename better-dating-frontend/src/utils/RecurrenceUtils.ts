import * as Messages from '../Messages';

enum Recurrence { // TODO use enum ?
    neverDid,
    neverPurposefully,
    didBeforeNotGoingInFuture,
    coupleTimesInYearOrMoreSeldom,
    coupleTimesInYear,
    coupleTimesInMonth,
    coupleTimesInWeek,
    everyDay,
    severalTimesInDay
}

const neverPurposefully = {
    label: Messages.neverPurposefully,
    value: 'neverPurposefully'
};
const coupleTimesInYear = {
    label: Messages.coupleTimesInYear,
    value: 'coupleTimesInYear'
};
const coupleTimesInMonth = {
    label: Messages.coupleTimesInMonth,
    value: 'coupleTimesInMonth'
};
const coupleTimesInWeek = {
    label: Messages.coupleTimesInWeek,
    value: 'coupleTimesInWeek'
};
const everyDay = {
    label: Messages.everyDay,
    value: 'everyDay'
};
const severalTimesInDay = {
    label: Messages.severalTimesInDay,
    value: 'severalTimesInDay'
};
const neverDid = {
    label: Messages.neverDid,
    value: 'neverDid'
};
const didBeforeNotGoingInFuture = {
    label: Messages.didBeforeNotGoingInFuture,
    value: 'didBeforeNotGoingInFuture'
};
const coupleTimesInYearOrMoreSeldom = {
    label: Messages.coupleTimesInYearOrMoreSeldom,
    value: 'coupleTimesInYearOrMoreSeldom'
};

export const physicalExerciseOptions = [
    neverPurposefully, coupleTimesInYear, coupleTimesInMonth,
    coupleTimesInWeek, everyDay, severalTimesInDay
];
export const smokingOptions = [
    neverDid, didBeforeNotGoingInFuture, coupleTimesInYear, coupleTimesInMonth,
    coupleTimesInWeek, everyDay, severalTimesInDay
];
export const alcoholOptions = smokingOptions;
export const computerGamesOptions = [
    neverDid, didBeforeNotGoingInFuture, coupleTimesInYearOrMoreSeldom, coupleTimesInYear, coupleTimesInMonth,
    coupleTimesInWeek, everyDay, severalTimesInDay
];
export const gamblingOptions = computerGamesOptions;
export const haircutOptions = computerGamesOptions;
export const hairColoringOptions = computerGamesOptions;
export const makeupOptions = computerGamesOptions;
export const intimateRelationsOutsideOfMarriageOptions = computerGamesOptions;
export const pornographyWatchingOptions = computerGamesOptions;
