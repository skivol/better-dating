import { BetterDatingAction } from '../actions';
import { StatusSnackbarState, SnackbarVariant } from '../types';
import {
	OPEN_SNACKBAR,
	CLOSE_SNACKBAR
} from '../constants';

const initialSnackbarState: StatusSnackbarState = {
	isOpen: false, message: '', variant: SnackbarVariant.info
};
export const snackbarReducer = (state = initialSnackbarState, action: BetterDatingAction) => {
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
