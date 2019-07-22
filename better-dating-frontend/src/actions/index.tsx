import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { getFormValues, isInvalid, SubmissionError } from 'redux-form';
import { SnackbarVariant } from '../types';
import { ThunkResult, BetterDatingStoreState } from '../configureStore';
import * as constants from '../constants';
import { postData } from '../FetchUtils';
import * as Messages from './Messages';

export interface OpenSnackbar {
	type: constants.OPEN_SNACKBAR;
	message: string;
	variant: SnackbarVariant;
}

export interface CloseSnackbar {
	type: constants.CLOSE_SNACKBAR;
}

export interface ExpiredToken {
	type: constants.EXPIRED_TOKEN;
}

export type BetterDatingAction = OpenSnackbar | CloseSnackbar | ExpiredToken;

export const openSnackbar = (message: string, variant: SnackbarVariant): OpenSnackbar => ({
	type: constants.OPEN_SNACKBAR,
	message, variant
});
export const closeSnackbar = (): CloseSnackbar => ({
	type: constants.CLOSE_SNACKBAR
});

export const expiredToken = (): ExpiredToken => ({
	type: constants.EXPIRED_TOKEN
});

export const submitEmail = (): ThunkResult<void> => async (dispatch: ThunkDispatch<{}, {}, Action>, getState: () => BetterDatingStoreState) => {
	const state = getState();
	if (isInvalid('EmailForm')(state)) {
		return;
	}
	const values: any = getFormValues(constants.EMAIL_FORM_ID)(state);
	try {
		await postData(
			'/api/user/email/submit', { email: values.email }
		);
		dispatch(openSnackbar(Messages.successSubmittingEmailMessage, SnackbarVariant.success));
	} catch (error) {
		dispatch(openSnackbar(Messages.errorSubmittingEmailMessage, SnackbarVariant.error));
		throw new SubmissionError(error);
	}
};

export const verifyEmail = (token: string): ThunkResult<void> => async (dispatch: ThunkDispatch<{}, {}, Action>, getState: () => BetterDatingStoreState) => {
	try {
		await postData(
			'/api/user/email/verify', { token }
		);
		dispatch(openSnackbar(Messages.successVerifyingEmailMessage, SnackbarVariant.success));
	} catch (error) {
		dispatch(openSnackbar(Messages.resolveMessage(error.message), SnackbarVariant.error));
		if (error.message === Messages.expiredTokenMessage) {
			dispatch(expiredToken());
		}
	}
};

export const requestAnotherValidationToken = (previousToken: string): ThunkResult<void> => async (dispatch: ThunkDispatch<{}, {}, Action>, getState: () => BetterDatingStoreState) => {
	try {
		await postData(
			'/api/user/email/new-verification', { token: previousToken }
		);
		dispatch(openSnackbar(Messages.successTriggeringNewVerificationMessage, SnackbarVariant.success));
	} catch (error) {
		dispatch(openSnackbar(Messages.resolveMessage(error.message), SnackbarVariant.error));
	}
}
 

