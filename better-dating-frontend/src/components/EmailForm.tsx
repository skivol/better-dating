import * as React from "react";
import { createStyles, makeStyles, withStyles, Theme, withTheme } from '@material-ui/core/styles';
import { Field, InjectedFormProps } from 'redux-form';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import Icon from '@material-ui/core/Icon';
import * as Messages from './Messages';

export interface SpinnerAdornmentProps {
	classes: any;
	theme: Theme;
}
const SpinnerAdornment = withTheme(withStyles({
  root: {
    marginLeft: 5
  }
})(({ classes, theme }: SpinnerAdornmentProps) => (
  <CircularProgress
    className={classes.spinner}
    style={{color: theme.palette.primary.contrastText}}
    size={20}
  />
)));

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

interface EmailFieldProps {
	input: object;
	meta: any;
	custom: any;
}

/* https://material-ui.com/components/text-fields/ */
// Consider using "redux-form-material-ui" (https://github.com/erikras/redux-form-material-ui)
const renderEmailField = ({ input, meta: { touched, error }, ...custom }: EmailFieldProps) => {
	const invalid = touched && error;
	return (
		<TextField
			error={invalid}
			helperText={invalid ? `(${invalid})` : null}
			name="email"
			label={Messages.Email}
			margin="normal"
			variant="outlined"
			InputProps={{
			  startAdornment: (
			    <InputAdornment position="start">
				    <Icon>email</Icon>
			    </InputAdornment>
			  ),
			}}
			{...input}
			{...custom}
		/>
	);
};

export interface Props extends InjectedFormProps<any, {}, string> {
	isInvalid: () => boolean;
}

const EmailForm = ({ handleSubmit, pristine, submitting, isInvalid }: Props) => {
	const classes = useStyles();
	return (
		<form onSubmit={handleSubmit}>
			<Grid
				container
				justify="center"
				alignItems="center"
				style={{height: '120px'}}
			>
				<Field name="email" component={renderEmailField} />
				{/* https://material-ui.com/components/buttons/ */}
				<Tooltip
					disableFocusListener
					title={ Messages.notifyMeWhenAvailable }
				>
					<div>
						<Button
							className={classes.button}
							variant="contained"
							color="primary"
							type="submit"
							disabled={pristine || submitting || isInvalid()}
						>
							{ submitting ? <SpinnerAdornment /> : <Icon className={classes.rightIcon}>send</Icon> }
						</Button>
					</div>
				</Tooltip>
			</Grid>
		</form>
	);
};

export default EmailForm;
