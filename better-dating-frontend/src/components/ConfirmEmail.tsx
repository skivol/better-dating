import * as React from "react";
import Link from 'next/link';
import { Form } from 'react-final-form';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import * as Messages from './Messages';
import { expiredTokenMessage } from '../Messages';
import SpinnerAdornment from './SpinnerAdornment';

type Props = {
	token: string;
	verified: boolean;
	onTokenVerified: () => void;
	errorVerifying?: string;
	onErrorVerifying: (error: string) => void;
	onRequestAnotherValidationToken: (prevToken: string) => any;
}

const ConfirmEmail = ({ token, onTokenVerified, verified, errorVerifying, onErrorVerifying, onRequestAnotherValidationToken }: Props) => {
	if (verified) {
		onTokenVerified();
	} else if (errorVerifying) {
		onErrorVerifying(errorVerifying);
	}

	const hasExpiredToken = errorVerifying === expiredTokenMessage;
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
	const backToMain = (
		<Link href="/">
			<Button variant="contained" color="primary">
				{Messages.backToMain}
			</Button>
		</Link>
	);
	return (
		<div style={{ height: '120px', textAlign: 'center', marginTop: '15px' }}>
			<Typography variant="h3">{Messages.emailVerification}</Typography>
			<div style={{ margin: '10px' }} />
			{requestAnotherValidationTokenButton || backToMain}
		</div>
	);
}

export default ConfirmEmail;
