import * as React from "react";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Form, Field } from 'react-final-form';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import SendIcon from '@material-ui/icons/Send';
import EmailIcon from '@material-ui/icons/Email';
import * as Messages from './Messages';
import SpinnerAdornment from './SpinnerAdornment';
import { getData } from '../FetchUtils';

// TODO check hover for tooltip on mobile: https://material-ui.com/components/tooltips/

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		button: {
			margin: theme.spacing(1),
		},
		rightIcon: {
			marginLeft: theme.spacing(1),
		},
	})
);

const validateEmail = (onCouldNotCheckIfAlreadyPresentEmail: () => void) => async (value: string) => {
	// 1. Required
	if (!value) {
		return Messages.requiredField;
	}
	// 2. Well formatted
	// TODO support cyrillyc letters in email ?
	if (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
		return Messages.invalidFormat;
	}

	// 3. Not used
	const checkIfEmailIsAlreadyPresent = (email: string) => getData('/api/user/email/status', { email });
	try {
		const { used }: any = await checkIfEmailIsAlreadyPresent(value);
		return used ? Messages.alreadyPresentEmail : undefined;
	} catch (error) {
		onCouldNotCheckIfAlreadyPresentEmail();
	}
};

export interface IFormData {
	email: string;
}

export interface IDispatchProps {
	onSubmit: (data: IFormData) => void;
	onCouldNotCheckIfAlreadyPresentEmail: () => void;
}

/* https://material-ui.com/components/text-fields/ */
// Consider using "mui-rff" (https://github.com/lookfirst/mui-rff)
export const EmailForm: React.SFC<IDispatchProps> = ({ onSubmit, onCouldNotCheckIfAlreadyPresentEmail }) => {
	const classes = useStyles();
	return (
		<Form
			initialValues={{
				email: ''
			}}
			onSubmit={onSubmit}
			render={({ handleSubmit, pristine, submitting }) => (
				<form onSubmit={handleSubmit}>
					<Grid
						container
						justify="center"
						alignItems="center"
						style={{ height: '120px' }}
					>
						<Field name="email" validate={validateEmail(onCouldNotCheckIfAlreadyPresentEmail)}>
							{({ input, meta: { touched, error }, ...custom }) => {
								const invalid = touched && error;
								return (
									<TextField
										error={invalid}
										helperText={invalid ? `(${invalid})` : null}
										label={Messages.Email}
										margin="normal"
										variant="outlined"
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<EmailIcon />
												</InputAdornment>
											),
										}}
										{...input}
										{...custom}
									/>
								);
							}}
						</Field>
						{/* https://material-ui.com/components/buttons/ */}
						<Tooltip
							disableFocusListener
							title={Messages.notifyMeWhenAvailable}
						>
							<div>
								<Button
									className={classes.button}
									variant="contained"
									color="primary"
									type="submit"
									disabled={pristine || submitting}
								>
									{submitting ? <SpinnerAdornment /> : <SendIcon className={classes.rightIcon} />}
								</Button>
							</div>
						</Tooltip>
					</Grid>
				</form>
			)}
		/>
	);
};

export default EmailForm;
