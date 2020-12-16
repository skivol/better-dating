import { Action } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { SnackbarVariant, UserState } from "../types";
import { ThunkResult } from "../configureStore";
import * as constants from "../constants";
import {
  browser,
  getData,
  postData,
  putData,
  deleteData,
  toBackendProfileValues,
} from "../utils";
import * as Messages from "./Messages";
import { resolveTokenMessage } from "../Messages";

export interface OpenSnackbar {
  type: constants.OPEN_SNACKBAR;
  message: string;
  variant: SnackbarVariant;
}

export interface CloseSnackbar {
  type: constants.CLOSE_SNACKBAR;
}

export interface UserAction {
  type: constants.USER;
  user: UserState;
}

export type BetterDatingAction = OpenSnackbar | CloseSnackbar | UserAction;

export const openSnackbar = (
  message: string,
  variant: SnackbarVariant
): OpenSnackbar => ({
  type: constants.OPEN_SNACKBAR,
  message,
  variant,
});
export const closeSnackbar = (): CloseSnackbar => ({
  type: constants.CLOSE_SNACKBAR,
});

type ErrorResponse = { message: string };
const alreadyRegisteredNickname = (error: ErrorResponse) =>
  error.message === "Nickname already registered" &&
  Messages.alreadyPresentNickname;
const alreadyRegisteredEmail = (error: ErrorResponse) =>
  error.message === "Email already registered" && Messages.alreadyPresentEmail;
const resolveProfileError = (
  error: ErrorResponse,
  genericErrorMessage: string
) =>
  alreadyRegisteredEmail(error) ||
  alreadyRegisteredNickname(error) ||
  genericErrorMessage;
export const createAccount = (values: any): any => async (
  dispatch: ThunkDispatch<any, any, Action>
) => {
  try {
    await postData("/api/user/profile", toBackendProfileValues(values));
    dispatch(
      openSnackbar(
        Messages.successSubmittingProfileMessage,
        SnackbarVariant.success
      )
    );
  } catch (error) {
    const message = resolveProfileError(
      error,
      Messages.errorSubmittingProfileMessage
    );
    dispatch(openSnackbar(message, SnackbarVariant.error));
    throw error;
  }
};

export const requestLogin = (email: string): ThunkResult<void> => async (
  dispatch: ThunkDispatch<any, any, Action>
) => {
  try {
    await postData("/api/auth/login-link", { email });
    dispatch(openSnackbar(Messages.loginLinkWasSent, SnackbarVariant.info));
  } catch (error) {
    dispatch(
      openSnackbar(Messages.oopsSomethingWentWrong, SnackbarVariant.error)
    );
  }
};

export const performLogin = (token: string): any => async (
  dispatch: ThunkDispatch<any, any, Action>
) => {
  try {
    await postData("/api/auth/login", { token });
  } catch (error) {
    dispatch(
      openSnackbar(
        `${Messages.errorLogin}: ${resolveTokenMessage(error)}`,
        SnackbarVariant.error
      )
    );
    throw error;
  }
};

export const updateAccount = (
  values: any,
  emailChanged: boolean | undefined
): any => async (dispatch: ThunkDispatch<any, any, Action>) => {
  try {
    const response = await putData(
      `/api/user/profile`,
      toBackendProfileValues(values)
    );

    const successMessage = emailChanged
      ? Messages.successUpdatingProfileAndChangingEmailMessage
      : Messages.successUpdatingProfileMessage;
    dispatch(openSnackbar(successMessage, SnackbarVariant.success));

    return response;
  } catch (error) {
    const message = resolveProfileError(
      error,
      Messages.errorUpdatingProfileMessage
    );
    dispatch(openSnackbar(message, SnackbarVariant.error));
    throw error;
  }
};

export const requestAccountRemoval = (): any => async (
  dispatch: ThunkDispatch<any, any, Action>
) => {
  try {
    await postData("/api/user/profile/request-removal");
    dispatch(
      openSnackbar(Messages.linkForRemovingProfileWasSent, SnackbarVariant.info)
    );
  } catch (error) {
    dispatch(
      openSnackbar(Messages.oopsSomethingWentWrong, SnackbarVariant.error)
    );
    throw error;
  }
};

export const removeAccount = (
  token: string,
  reason: string,
  explanationComment: string
): any => async (dispatch: ThunkDispatch<any, any, Action>) => {
  try {
    await deleteData("/api/user/profile", {
      token,
      reason,
      explanationComment,
    });
    dispatch(openSnackbar(Messages.profileWasRemoved, SnackbarVariant.info));
    dispatch(user(constants.emptyUser));
  } catch (error) {
    dispatch(openSnackbar(resolveTokenMessage(error), SnackbarVariant.error));
  }
};

export const viewAuthorsProfile = (): any => async (
  dispatch: ThunkDispatch<any, any, Action>
) => {
  try {
    await postData("/api/user/profile/authors-profile");
    dispatch(
      openSnackbar(
        Messages.linkForViewingAuthorsProfileWasSent,
        SnackbarVariant.info
      )
    );
  } catch (error) {
    dispatch(
      openSnackbar(Messages.oopsSomethingWentWrong, SnackbarVariant.error)
    );
    throw error;
  }
};

export const activateSecondStage = (values: any): any => async (
  dispatch: ThunkDispatch<any, any, Action>
) => {
  try {
    await postData("/api/user/profile/activate-second-stage", values);
    dispatch(openSnackbar(Messages.secondStageEnabled, SnackbarVariant.info));
  } catch (error) {
    dispatch(
      openSnackbar(Messages.oopsSomethingWentWrong, SnackbarVariant.error)
    );
    throw error;
  }
};

export const requestAnotherValidationToken = (
  previousToken: string
): ThunkResult<void> => async (dispatch: ThunkDispatch<any, any, Action>) => {
  try {
    await postData("/api/user/email/new-verification", {
      token: previousToken,
    });
    dispatch(
      openSnackbar(
        Messages.successTriggeringNewVerificationMessage,
        SnackbarVariant.success
      )
    );
  } catch (error) {
    dispatch(
      openSnackbar(resolveTokenMessage(error.message), SnackbarVariant.error)
    );
  }
};

export const fetchUser = (): ThunkResult<void> => async (
  dispatch: ThunkDispatch<any, any, Action>
) => {
  if (browser()) {
    dispatch(user({ ...constants.emptyUser, loading: true }));
    try {
      const response = await getData("/api/auth/me");
      dispatch(user({ ...constants.emptyUser, ...response }));
    } catch (e) {
      dispatch(user({ ...constants.emptyUser, loadError: e }));
    }
  }
};

export const user = (user: any) => ({
  type: constants.USER,
  user,
});

export const logout = (): any => async (
  dispatch: ThunkDispatch<any, any, Action>
) => {
  try {
    await postData("/api/auth/logout");
    dispatch(openSnackbar(Messages.successLogout, SnackbarVariant.success));
    dispatch(user(constants.emptyUser));
  } catch (error) {
    dispatch(openSnackbar(Messages.errorLogout, SnackbarVariant.error));
  }
};
