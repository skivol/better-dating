import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { getFormValues, isInvalid, SubmissionError } from 'redux-form';
import { SnackbarVariant } from '../types';
import { ThunkResult, BetterDatingStoreState } from '../configureStore';
import * as constants from '../constants';
import { postData } from '../FetchUtils';
import Messages from './Messages';

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

export const submitEmail = (): ThunkResult<void> => async (dispatch: ThunkDispatch<{}, {}, Action>, getState: () => BetterDatingStoreState) => {
	const state = getState();
	if (isInvalid('EmailForm')(state)) {
		return;
	}
	const values: any = getFormValues(constants.EMAIL_FORM_ID)(state);
	try {
		await postData(
			'/api/user/submit-email', { email: values.email }
		);
		dispatch(openSnackbar(Messages.successSubmittingEmailMessage, SnackbarVariant.success));
	} catch (error) {
		dispatch(openSnackbar(Messages.errorSubmittingEmailMessage, SnackbarVariant.error));
		throw new SubmissionError(error);
	}
};
