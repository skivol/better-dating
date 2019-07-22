import { BetterDatingAction } from '../actions';
import { StatusSnackbarState, SnackbarVariant, ExpiredTokenState } from '../types';
import {
	OPEN_SNACKBAR,
	CLOSE_SNACKBAR,
	EXPIRED_TOKEN
} from '../constants';

const initialSnackbarState: StatusSnackbarState = { 
	isOpen: false, message: '', variant: SnackbarVariant.info
};
export function snackbarReducer(
	state = initialSnackbarState, action: BetterDatingAction
): StatusSnackbarState {
	switch (action.type) {
		case OPEN_SNACKBAR:
			const { message, variant } = action;
			return { ...state, isOpen: true, message, variant };
		case CLOSE_SNACKBAR:
			return { ...state, isOpen: false };
		default:
			return state;
	}
}

const initialExpiredTokenState: ExpiredTokenState = {
	hasExpiredToken: false
};

export function expiredTokenReducer(
	state = initialExpiredTokenState, action: BetterDatingAction
): ExpiredTokenState {
	switch (action.type) {
		case EXPIRED_TOKEN:
			return { ...state, hasExpiredToken: true };
		default:
			return state;
	}
}
