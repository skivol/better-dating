import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import CloseIcon from "@material-ui/icons/Close";
import WarningIcon from "@material-ui/icons/Warning";
import { amber, green } from "@material-ui/core/colors";
import { IconButton, Snackbar, SnackbarContent } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { SnackbarVariant } from "../types";
import * as actions from "../actions";

const variantIcon = {
  [SnackbarVariant.success]: CheckCircleIcon,
  [SnackbarVariant.warning]: WarningIcon,
  [SnackbarVariant.error]: ErrorIcon,
  [SnackbarVariant.info]: InfoIcon,
};

const contentStyles = makeStyles((theme: Theme) => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.main,
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: "flex",
    alignItems: "center",
  },
}));

const wrapperStyles = makeStyles((theme: Theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
}));

type State = {
  snackbar: {
    isOpen: boolean;
    message?: string;
    variant: keyof typeof variantIcon;
  };
};

// https://material-ui.com/components/snackbars/
const StatusSnackbar = () => {
  const {
    isOpen,
    message,
    variant,
  } = useSelector(({ snackbar: { isOpen, message, variant } }: State) => ({
    isOpen,
    message,
    variant,
  }));
  const contentClasses = contentStyles();
  const wrapperClasses = wrapperStyles();
  const Icon = variantIcon[variant];
  const dispatch = useDispatch();
  const onClose = () => dispatch(actions.closeSnackbar());

  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      key="status-snackbar"
      open={isOpen}
      onClose={onClose}
      autoHideDuration={7000}
    >
      <SnackbarContent
        className={clsx(contentClasses[variant], wrapperClasses.margin)}
        aria-describedby="client-snackbar"
        message={
          <span id="client-snackbar" className={contentClasses.message}>
            <Icon
              className={clsx(contentClasses.icon, contentClasses.iconVariant)}
            />
            {message}
          </span>
        }
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={onClose}
          >
            <CloseIcon className={contentClasses.icon} />
          </IconButton>,
        ]}
      />
    </Snackbar>
  );
};

export default StatusSnackbar;
