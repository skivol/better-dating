import * as Messages from '../Messages';

export type Recurrence =
    "neverPurposefully" |
    "neverDidButDoNotKnowIfGoingToDoInFuture" |
    "neverDidAndNotGoingInFuture" |
    "didBeforeButDoNotKnowIfGoingToDoInFuture" |
    "didBeforeNotGoingInFuture" |
    "coupleTimesInYearOrMoreSeldom" |
    "coupleTimesInYear" |
    "coupleTimesInMonth" |
    "coupleTimesInWeek" |
    "everyDay" |
    "severalTimesInDay";

const neverPurposefully = {
    label: Messages.neverPurposefully,
    value: "neverPurposefully"
};
const neverDidAndNotGoingInFuture = {
    label: Messages.neverDidAndNotGoingInFuture,
    value: "neverDidAndNotGoingInFuture"
};
const neverDidButDoNotKnowIfGoingToDoInFuture = {
    label: Messages.neverDidButDoNotKnowIfGoingToDoInFuture,
    value: "neverDidButDoNotKnowIfGoingToDoInFuture"
};
const didBeforeButDoNotKnowIfGoingToDoInFuture = {
    label: Messages.didBeforeButDoNotKnowIfGoingToDoInFuture,
    value: "didBeforeButDoNotKnowIfGoingToDoInFuture"
};
const didBeforeNotGoingInFuture = {
    label: Messages.didBeforeNotGoingInFuture,
    value: "didBeforeNotGoingInFuture"
};
const coupleTimesInYear = {
    label: Messages.coupleTimesInYear,
    value: "coupleTimesInYear"
};
const coupleTimesInMonth = {
    label: Messages.coupleTimesInMonth,
    value: "coupleTimesInMonth"
};
const coupleTimesInWeek = {
    label: Messages.coupleTimesInWeek,
    value: "coupleTimesInWeek"
};
const everyDay = {
    label: Messages.everyDay,
    value: "everyDay"
};
const severalTimesInDay = {
    label: Messages.severalTimesInDay,
    value: "severalTimesInDay"
};
const coupleTimesInYearOrMoreSeldom = {
    label: Messages.coupleTimesInYearOrMoreSeldom,
    value: "coupleTimesInYearOrMoreSeldom"
};

const defaultOptions = [
    neverDidButDoNotKnowIfGoingToDoInFuture, neverDidAndNotGoingInFuture, didBeforeButDoNotKnowIfGoingToDoInFuture,
    didBeforeNotGoingInFuture, coupleTimesInYearOrMoreSeldom, coupleTimesInYear, coupleTimesInMonth,
    coupleTimesInWeek, everyDay, severalTimesInDay
];
export const physicalExerciseOptions = [
    neverPurposefully, ...defaultOptions
];
export const smokingOptions = defaultOptions;
export const alcoholOptions = defaultOptions;
export const computerGamesOptions = defaultOptions;
export const gamblingOptions = defaultOptions;
export const haircutOptions = defaultOptions;
export const hairColoringOptions = defaultOptions;
export const makeupOptions = defaultOptions;
export const intimateRelationsOutsideOfMarriageOptions = defaultOptions;
export const pornographyWatchingOptions = defaultOptions;
