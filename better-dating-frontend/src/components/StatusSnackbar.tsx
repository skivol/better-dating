import React from 'react';
import clsx from 'clsx';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import { amber, green } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { SnackbarVariant } from '../types';

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
    display: 'flex',
    alignItems: 'center',
  },
}));

const wrapperStyles = makeStyles((theme: Theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
}));

export interface Props {
	isOpen: boolean;
	message?: string;
	onClose?: () => void;
	variant: keyof typeof variantIcon;
}

// https://material-ui.com/components/snackbars/
const StatusSnackbar = ({ isOpen, message, onClose, variant, ...other }: Props) => {
	const contentClasses = contentStyles();
	const wrapperClasses = wrapperStyles();
	const Icon = variantIcon[variant];

	return (
		<Snackbar
			anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
						<Icon className={clsx(contentClasses.icon, contentClasses.iconVariant)} />
						{message}
					</span>
				}
				action={[
					<IconButton key="close" aria-label="Close" color="inherit" onClick={onClose}>
						<CloseIcon className={contentClasses.icon} />
					</IconButton>,
				]}
				{...other}
			/>
		</Snackbar>
	);
}

export default StatusSnackbar;
