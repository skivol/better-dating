export const OPEN_SNACKBAR = 'OPEN_SNACKBAR';
export type OPEN_SNACKBAR = typeof OPEN_SNACKBAR;

export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR';
export type CLOSE_SNACKBAR = typeof CLOSE_SNACKBAR;

export const USER = 'USER';
export type USER = typeof USER;
export const emptyUser = { loading: false, loadError: null, id: null, roles: null };

export const updated = process.env.NEXT_APP_UPDATED || 'not_available';
