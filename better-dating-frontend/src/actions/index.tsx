import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { formatISO } from 'date-fns';
import { SnackbarVariant } from '../types';
import { ThunkResult } from '../configureStore';
import * as constants from '../constants';
import { postData, putData } from '../utils/FetchUtils';
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

export const toBackendProfileValues = ({ bday, ...restValues }: any) => ({ ...restValues, birthday: formatISO(bday, { representation: 'date' }) });

const alreadyRegisteredEmail = (error: { message: string; }) => error.message === 'Email already registered';
export const createAccount = (values: any): ThunkResult<void> => async (dispatch: ThunkDispatch<{}, {}, Action>) => {
	try {
		await postData('/api/user/profile', toBackendProfileValues(values));
		dispatch(openSnackbar(Messages.successSubmittingProfileMessage, SnackbarVariant.success));
	} catch (error) {
		if (alreadyRegisteredEmail(error)) {
			return dispatch(openSnackbar(Messages.alreadyPresentEmail, SnackbarVariant.error));
		}
		dispatch(openSnackbar(Messages.errorSubmittingProfileMessage, SnackbarVariant.error));
	}
};

export const requestLogin = (email: string): ThunkResult<void> => async (dispatch: ThunkDispatch<{}, {}, Action>) => {
	try {
		await postData('/api/auth/login-link', { email });
		dispatch(openSnackbar(Messages.loginLinkWasSent, SnackbarVariant.info));
	} catch (error) {
		dispatch(openSnackbar(Messages.oopsSomethingWentWrong, SnackbarVariant.error));
	}
};

export const performLogin = (token: string): ThunkResult<void> => async (dispatch: ThunkDispatch<{}, {}, Action>) => {
	try {
		await postData('/api/auth/login', { token });
	} catch (error) {
		dispatch(openSnackbar(resolveTokenMessage(error), SnackbarVariant.error));
		throw error;
	}
};

export const updateAccount = (values: any, emailChanged: boolean | undefined, doAfter: () => void): ThunkResult<void> => async (dispatch: ThunkDispatch<{}, {}, Action>) => {
	try {
		await putData(`/api/user/profile/${values.id}`, toBackendProfileValues(values));
		const successMessage = emailChanged ? Messages.successUpdatingProfileAndChangingEmailMessage : Messages.successUpdatingProfileMessage;
		dispatch(openSnackbar(successMessage, SnackbarVariant.success));
		doAfter();
	} catch (error) {
		if (alreadyRegisteredEmail(error)) {
			return dispatch(openSnackbar(Messages.alreadyPresentEmail, SnackbarVariant.error));
		}
		dispatch(openSnackbar(Messages.errorUpdatingProfileMessage, SnackbarVariant.error));
	}
};

export const requestAnotherValidationToken = (previousToken: string): ThunkResult<void> => async (dispatch: ThunkDispatch<{}, {}, Action>) => {
	try {
		await postData('/api/user/email/new-verification', { token: previousToken });
		dispatch(openSnackbar(Messages.successTriggeringNewVerificationMessage, SnackbarVariant.success));
	} catch (error) {
		dispatch(openSnackbar(resolveTokenMessage(error.message), SnackbarVariant.error));
	}
}

export const logout = (): ThunkResult<void> => async (dispatch: ThunkDispatch<{}, {}, Action>) => {
	try {
		await postData('/api/auth/logout');
		dispatch(openSnackbar(Messages.successLogout, SnackbarVariant.success));
	} catch (error) {
		dispatch(openSnackbar(Messages.errorLogout, SnackbarVariant.error));
	}
};
