import { parseISO, isBefore, subYears } from 'date-fns';
import { getData } from './FetchUtils';
import * as Messages from '../Messages';

const simpleMemoize = (fn: any) => {
    let lastArg: any;
    let lastResult: any;
    return (arg: any) => {
        if (arg !== lastArg) {
            lastArg = arg;
            lastResult = fn(arg);
        }
        return lastResult;
    }
};
const composeValidators = (...validators: any[]) => (value: any) =>
    validators.reduce((error, validator) => error || validator(value), undefined)
export const required = (value: any) => (value ? undefined : Messages.requiredField);
const min = (minValue: number) => (value: number) => (value < minValue ? Messages.minValue(minValue) : undefined)
const max = (maxValue: number) => (value: number) => (maxValue < value ? Messages.maxValue(maxValue) : undefined)
const validEmailFormat = (value: string) => {
    // TODO support cyrillyc letters in email ?
    if (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
        return Messages.invalidFormat;
    }
    return undefined;
}
const validateEmailAvailability = (onCouldNotCheckIfAlreadyPresentEmail: () => void) => simpleMemoize(async (value: string) => {
    // Not used
    const checkIfEmailIsAlreadyPresent = (email: string) => getData('/api/user/email/status', { email });
    try {
        const { used }: any = await checkIfEmailIsAlreadyPresent(value);
        return used ? Messages.alreadyPresentEmail : undefined;
    } catch (error) {
        onCouldNotCheckIfAlreadyPresentEmail();
    }
});
const olderThan12 = (value: string) => (isBefore(subYears(new Date(), 12), parseISO(value)) ? Messages.shouldBeOlderThan12 : undefined);
const youngerThan150 = (value: string) => (isBefore(parseISO(value), subYears(new Date(), 150)) ? Messages.maxValue(150) : undefined);

export const validateEmail = (onCouldNotCheckIfAlreadyPresentEmail: () => void) => composeValidators(required, validEmailFormat, validateEmailAvailability(onCouldNotCheckIfAlreadyPresentEmail));

export const validateBirthday = composeValidators(required, olderThan12, youngerThan150);

export const validateHeight = composeValidators(required, min(120), max(250));

export const validateWeight = composeValidators(required, min(27), max(250));

export const validatePersonalHealthEvaluation = composeValidators(required, min(1), max(10));
