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
  showError,
  showInfo,
  showSuccess,
  showWarning,
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
export const createAccount =
  (values: any): any =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      await postData("/api/user/profile", toBackendProfileValues(values));
      showSuccess(dispatch, Messages.successSubmittingProfileMessage);
    } catch (error) {
      showError(
        dispatch,
        resolveProfileError(error, Messages.errorSubmittingProfileMessage)
      );
      throw error;
    }
  };

export const requestLogin =
  (email: string): ThunkResult<void> =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      await postData("/api/auth/login-link", { email });
      showInfo(dispatch, Messages.loginLinkWasSent);
    } catch (error) {
      showError(dispatch, Messages.oopsSomethingWentWrong);
    }
  };

export const performLogin =
  (token: string): any =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      await postData("/api/auth/login", { token });
    } catch (error) {
      showError(
        dispatch,
        `${Messages.errorLogin}: ${resolveTokenMessage(error)}`
      );
      throw error;
    }
  };

export const updateAccount =
  (values: any, emailChanged: boolean | undefined): any =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      const response = await putData(
        `/api/user/profile`,
        toBackendProfileValues(values)
      );

      const successMessage = emailChanged
        ? Messages.successUpdatingProfileAndChangingEmailMessage
        : Messages.successUpdatingProfileMessage;
      showSuccess(dispatch, successMessage);

      return response;
    } catch (error) {
      showError(
        dispatch,
        resolveProfileError(error, Messages.errorUpdatingProfileMessage)
      );
      throw error;
    }
  };

export const requestAccountRemoval =
  (): any => async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      await postData("/api/user/profile/request-removal");
      showInfo(dispatch, Messages.linkForRemovingProfileWasSent);
    } catch (error) {
      showError(dispatch, Messages.oopsSomethingWentWrong);
      throw error;
    }
  };

export const removeAccount =
  (token: string, reason: string, explanationComment: string): any =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      await deleteData("/api/user/profile", {
        token,
        reason,
        explanationComment,
      });
      showInfo(dispatch, Messages.profileWasRemoved);
      dispatch(user(constants.emptyUser));
    } catch (error) {
      showError(dispatch, resolveTokenMessage(error.message) as string);
    }
  };

export const viewAuthorsProfile =
  (): any => async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      await postData("/api/user/profile/authors-profile");
      showInfo(dispatch, Messages.linkForViewingAuthorsProfileWasSent);
    } catch (error) {
      showError(dispatch, Messages.oopsSomethingWentWrong);
      throw error;
    }
  };

export const viewOtherUserProfile =
  ({ id, nickname }: any): any =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      await postData("/api/user/profile/user-profile", { targetId: id });
      showInfo(dispatch, Messages.linkForViewingUsersProfileWasSent(nickname));
    } catch (error) {
      showError(dispatch, Messages.resolveViewOtherUserProfileError(error));
      throw error;
    }
  };

export const activateSecondStage =
  (values: any): any =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      const response = await postData(
        "/api/user/profile/activate-second-stage",
        values
      );
      showInfo(dispatch, Messages.secondStageEnabled);
      return response;
    } catch (error) {
      showError(dispatch, Messages.oopsSomethingWentWrong);
      throw error;
    }
  };

export const requestAnotherValidationToken =
  (previousToken: string): ThunkResult<void> =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      await postData("/api/user/email/new-verification", {
        token: previousToken,
      });
      showSuccess(dispatch, Messages.successTriggeringNewVerificationMessage);
    } catch (error) {
      showError(dispatch, resolveTokenMessage(error.message) as string);
    }
  };

export const requestAnotherViewProfileToken =
  (previousToken: string): ThunkResult<void> =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      await postData("/api/user/profile/new-view-user-profile", {
        token: previousToken,
      });
      showSuccess(dispatch, Messages.successRequestingNewProfileViewMessage);
    } catch (error) {
      showError(dispatch, resolveTokenMessage(error.message) as string);
    }
  };

export const addPlace =
  ({ dateId, name, lat, lng }: any): any =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      await postData("/api/place/add", {
        dateId,
        name,
        lat,
        lng,
      });
      showSuccess(dispatch, Messages.successAddingPlaceTheUserWasNotified);
    } catch (error) {
      showError(dispatch, Messages.resolveAddPlaceError(error));
      throw error;
    }
  };

export const approvePlace =
  ({ dateId }: any): any =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      await postData("/api/place/approve", {
        dateId,
      });
      showSuccess(dispatch, Messages.successApprovingThePlace);
    } catch (error) {
      showError(dispatch, Messages.resolveAddPlaceError(error));
      throw error;
    }
  };

export const fetchUser =
  (): ThunkResult<void> =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
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

export const logout =
  (): any => async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      await postData("/api/auth/logout");
      showSuccess(dispatch, Messages.successLogout);
      dispatch(user(constants.emptyUser));
    } catch (error) {
      showError(dispatch, Messages.errorLogout);
    }
  };

export const checkIn =
  (values: any): any =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      const { dateStatus } = await postData(
        "/api/user/dating/check-in",
        values
      );
      showSuccess(
        dispatch,
        `${Messages.successCheckIn}${
          dateStatus === "fullCheckIn"
            ? " " + Messages.secondUserHasAlreadyArrived
            : ""
        }`
      );
      return dateStatus;
    } catch (error) {
      showError(dispatch, Messages.resolveCheckInError(error));
    }
  };

export const verifyDate =
  (values: any): any =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      const response = await postData("/api/user/dating/verify-date", values);
      showSuccess(dispatch, Messages.successVerifyingDate);
      return response;
    } catch (error) {
      showError(dispatch, Messages.resolveVerifyDateError(error));
    }
  };

export const evaluateProfile =
  (values: any): any =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      const response = await postData(
        "/api/user/dating/evaluate-profile",
        values
      );
      showSuccess(dispatch, Messages.successEvaluatingProfile);
      return response;
    } catch (error) {
      showError(dispatch, Messages.resolveEvaluateProfileError(error));
    }
  };

export const submitPairDecision =
  (values: any): any =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      const response = await postData("/api/user/pairs/decision", values);
      showSuccess(
        dispatch,
        `${Messages.successSubmittingPairDecision}${
          response.bothWantToContinue
            ? " " + Messages.secondUserAlsoWantsToContinueRelationships
            : ""
        }`
      );
      return response;
    } catch (error) {
      showError(dispatch, Messages.resolvePairDecisionSubmitError(error));
    }
  };

export const rescheduleDate =
  (values: any, currentPlaceId: string): any =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      const response = await postData(
        "/api/user/dating/reschedule-date",
        values
      );
      const placeChanged = response.date.placeId !== currentPlaceId;
      (placeChanged ? showWarning : showSuccess)(
        dispatch,
        `${Messages.dateIsRescheduledAndOtherUserIsNotified}${
          placeChanged ? " " + Messages.placeChanged : ""
        }`
      );
      return response;
    } catch (error) {
      showError(dispatch, Messages.resolveRescheduleDateError(error));
    }
  };

export const cancelDate =
  (values: any): any =>
  async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      const response = await postData("/api/user/dating/cancel-date", values);
      showWarning(dispatch, Messages.dateIsCancelledAndOtherUserIsNotified);
      return response;
    } catch (error) {
      showError(dispatch, Messages.resolveCancelDateError(error));
    }
  };

export const fetchHistory =
  (values: any) => async (dispatch: ThunkDispatch<any, any, Action>) => {
    try {
      const response = await getData("/api/history", values);
      return response;
    } catch (error) {
      showError(dispatch, Messages.oopsSomethingWentWrong);
    }
  };
