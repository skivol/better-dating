import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { SnackbarVariant } from '../types';
import { ThunkResult } from '../configureStore';
import * as constants from '../constants';
import { postData } from '../FetchUtils';
import * as Messages from './Messages';
import { resolveTokenMessage } from '../Messages';

export interface OpenSnackbar {
	type: constants.OPEN_SNACKBAR;
	message: string;
	variant: SnackbarVariant;
}

export interface CloseSnackbar {
	type: constants.CLOSE_SNACKBAR;
}

export type BetterDatingAction = OpenSnackbar | CloseSnackbar;

export const openSnackbar = (message: string, variant: SnackbarVariant): OpenSnackbar => ({
	type: constants.OPEN_SNACKBAR,
	message, variant
});
export const closeSnackbar = (): CloseSnackbar => ({
	type: constants.CLOSE_SNACKBAR
});

export const submitEmail = (values: any): ThunkResult<void> => async (dispatch: ThunkDispatch<{}, {}, Action>) => {
	try {
		await postData(
			'/api/user/email/submit', { email: values.email }
		);
		dispatch(openSnackbar(Messages.successSubmittingEmailMessage, SnackbarVariant.success));
	} catch (error) {
		dispatch(openSnackbar(Messages.errorSubmittingEmailMessage, SnackbarVariant.error));
	}
};

export const requestAnotherValidationToken = (previousToken: string): ThunkResult<void> => async (dispatch: ThunkDispatch<{}, {}, Action>) => {
	try {
		await postData(
			'/api/user/email/new-verification', { token: previousToken }
		);
		dispatch(openSnackbar(Messages.successTriggeringNewVerificationMessage, SnackbarVariant.success));
	} catch (error) {
		dispatch(openSnackbar(resolveTokenMessage(error.message), SnackbarVariant.error));
	}
}
