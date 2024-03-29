import { SnackbarVariant } from "../types";
import { openSnackbar } from "../actions";

export const showError = (dispatch: any, message: string) =>
  dispatch(openSnackbar(message, SnackbarVariant.error));
export const showSuccess = (dispatch: any, message: string) =>
  dispatch(openSnackbar(message, SnackbarVariant.success));
export const showWarning = (dispatch: any, message: string) =>
  dispatch(openSnackbar(message, SnackbarVariant.warning));
export const showInfo = (dispatch: any, message: string) =>
  dispatch(openSnackbar(message, SnackbarVariant.info));
