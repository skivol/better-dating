import * as React from "react";
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { Form } from 'react-final-form';
import { Typography, Button } from '@material-ui/core';
import { SnackbarVariant } from '../types';
import * as actions from '../actions';
import { resolveTokenMessage, successVerifyingEmailMessage } from '../Messages';
import { postData, useToken } from '../utils';
import { CenteredSpinner } from './common';
import { profile } from '../components/navigation/NavigationUrls';
import * as Messages from './Messages';
import { expiredTokenMessage } from '../Messages';
import { SpinnerAdornment } from './common';

const ConfirmEmail = () => {
	const token = useToken();
	const router = useRouter();
	const dispatch = useDispatch();
	const [hasExpiredToken, setHasExpiredToken] = React.useState<boolean | null>(null);

	const onRequestAnotherValidationToken = (previousToken: string) => dispatch(actions.requestAnotherValidationToken(previousToken));
	const onTokenVerified = () => dispatch(actions.openSnackbar(successVerifyingEmailMessage, SnackbarVariant.success));
	const onErrorVerifying = (errorMessage: string) => dispatch(actions.openSnackbar(resolveTokenMessage(errorMessage), SnackbarVariant.error));

	React.useEffect(() => {
		const verifyEmail = async (token: string) => {
			try {
				await postData(`/api/user/email/verify`, { token });
				return { verified: true };
			} catch (error) {
				return { verified: false, errorVerifying: error.message };
			}
		};

		verifyEmail(token).then(({ verified, errorVerifying }) => {
			if (verified) {
				onTokenVerified();
				setTimeout(() => router.push(profile), 5000);
			} else if (errorVerifying) {
				onErrorVerifying(errorVerifying);
				setHasExpiredToken(errorVerifying === expiredTokenMessage);
			}
		});
	}, [router]);

	if (hasExpiredToken === null) {
		return <CenteredSpinner />;
	}

	const requestAnotherValidationTokenButton = hasExpiredToken ? (
		<Form
			onSubmit={() => onRequestAnotherValidationToken(token)}
			render={({ handleSubmit, submitting }) => (
				<form onSubmit={handleSubmit}>
					<Button type="submit" variant="contained" color="primary" disabled={submitting}>
						{submitting ? <SpinnerAdornment /> : Messages.sendNewVerificationToken}
					</Button>
				</form>
			)}
		/>
	) : null;

	return (
		<div style={{ height: '120px', textAlign: 'center', marginTop: '15px' }}>
			<Typography variant="h3">{Messages.emailVerification}</Typography>
			<div style={{ margin: '10px' }} />
			{requestAnotherValidationTokenButton}
		</div>
	);
};

export default ConfirmEmail;
