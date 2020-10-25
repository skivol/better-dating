export enum SnackbarVariant {
  success = "success",
  warning = "warning",
  error = "error",
  info = "info",
}

export interface StatusSnackbarState {
  isOpen: boolean;
  message: string;
  variant: SnackbarVariant;
}

export interface UserState {
  loading: boolean;
  loadError: any;
  id: string | null;
  roles: any;
}
