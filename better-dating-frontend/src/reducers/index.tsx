import { BetterDatingAction, UserAction } from "../actions";
import { StatusSnackbarState, SnackbarVariant, UserState } from "../types";
import { OPEN_SNACKBAR, CLOSE_SNACKBAR, USER, emptyUser } from "../constants";

const initialSnackbarState: StatusSnackbarState = {
  isOpen: false,
  message: "",
  variant: SnackbarVariant.info,
};
export const snackbarReducer = (
  state = initialSnackbarState,
  action: BetterDatingAction
) => {
  switch (action.type) {
    case OPEN_SNACKBAR:
      const { message, variant } = action;
      return { ...state, isOpen: true, message, variant };
    case CLOSE_SNACKBAR:
      return { ...state, isOpen: false };
    default:
      return state;
  }
};

const initialUserState: UserState = emptyUser;
export const userReducer = (state = initialUserState, action: UserAction) => {
  switch (action.type) {
    case USER:
      return { ...action.user };
    default:
      return state;
  }
};
