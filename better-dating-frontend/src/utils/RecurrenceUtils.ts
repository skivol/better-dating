import * as Messages from "../Messages";

export type Recurrence =
  | "NeverPurposefully"
  | "NeverDidButDoNotKnowIfGoingToDoInFuture"
  | "NeverDidAndNotGoingInFuture"
  | "DidBeforeButDoNotKnowIfGoingToDoInFuture"
  | "DidBeforeNotGoingInFuture"
  | "CoupleTimesInYearOrMoreSeldom"
  | "CoupleTimesInYear"
  | "CoupleTimesInMonth"
  | "CoupleTimesInWeek"
  | "EveryDay"
  | "SeveralTimesInDay";

const neverPurposefully = {
  label: Messages.neverPurposefully,
  value: "NeverPurposefully",
};
const neverDidAndNotGoingInFuture = {
  label: Messages.neverDidAndNotGoingInFuture,
  value: "NeverDidAndNotGoingInFuture",
};
const neverDidButDoNotKnowIfGoingToDoInFuture = {
  label: Messages.neverDidButDoNotKnowIfGoingToDoInFuture,
  value: "NeverDidButDoNotKnowIfGoingToDoInFuture",
};
const didBeforeButDoNotKnowIfGoingToDoInFuture = {
  label: Messages.didBeforeButDoNotKnowIfGoingToDoInFuture,
  value: "DidBeforeButDoNotKnowIfGoingToDoInFuture",
};
const didBeforeNotGoingInFuture = {
  label: Messages.didBeforeNotGoingInFuture,
  value: "DidBeforeNotGoingInFuture",
};
const coupleTimesInYear = {
  label: Messages.coupleTimesInYear,
  value: "CoupleTimesInYear",
};
const coupleTimesInMonth = {
  label: Messages.coupleTimesInMonth,
  value: "CoupleTimesInMonth",
};
const coupleTimesInWeek = {
  label: Messages.coupleTimesInWeek,
  value: "CoupleTimesInWeek",
};
const everyDay = {
  label: Messages.everyDay,
  value: "EveryDay",
};
const severalTimesInDay = {
  label: Messages.severalTimesInDay,
  value: "SeveralTimesInDay",
};
const coupleTimesInYearOrMoreSeldom = {
  label: Messages.coupleTimesInYearOrMoreSeldom,
  value: "CoupleTimesInYearOrMoreSeldom",
};

const defaultOptions = [
  neverDidButDoNotKnowIfGoingToDoInFuture,
  neverDidAndNotGoingInFuture,
  didBeforeButDoNotKnowIfGoingToDoInFuture,
  didBeforeNotGoingInFuture,
  coupleTimesInYearOrMoreSeldom,
  coupleTimesInYear,
  coupleTimesInMonth,
  coupleTimesInWeek,
  everyDay,
  severalTimesInDay,
];
export const physicalExerciseOptions = [neverPurposefully, ...defaultOptions];
export const smokingOptions = defaultOptions;
export const alcoholOptions = defaultOptions;
export const computerGamesOptions = defaultOptions;
export const gamblingOptions = defaultOptions;
export const haircutOptions = defaultOptions;
export const hairColoringOptions = defaultOptions;
export const makeupOptions = defaultOptions;
export const intimateRelationsOutsideOfMarriageOptions = defaultOptions;
export const pornographyWatchingOptions = defaultOptions;
