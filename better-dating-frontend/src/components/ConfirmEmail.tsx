import * as React from "react";
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import * as Messages from './Messages';

export interface Props {
	location: any;
	onEmailVerify: (token: string) => void;
	onNoTokenProvided: () => void;
	hasExpiredToken: boolean;
	onRequestAnotherValidationToken: (prevToken: string) => any;
}

const ConfirmEmail = ({ location: { search }, onEmailVerify, onNoTokenProvided, hasExpiredToken, onRequestAnotherValidationToken }: Props) => {
	// https://developer.mozilla.org/ru/docs/Web/API/URLSearchParams
	const searchParams = new URLSearchParams(search.substring(1));
	if (!hasExpiredToken && !searchParams.has(Messages.tokenName)) {
		onNoTokenProvided();
	} else if (!hasExpiredToken) {
		onEmailVerify(searchParams.get(Messages.tokenName)!!);
	}
	const requestAnotherValidationTokenButton = hasExpiredToken ? (
		<Button variant="contained" color="primary" onClick={
			() => onRequestAnotherValidationToken(searchParams.get(Messages.tokenName)!!)}
		>
			{Messages.sendNewVerificationToken}
		</Button>
	) : null;
	return (
		<div style={{height: '120px', textAlign: 'center', marginTop: '15px'}}>
			<Typography variant="h3">{Messages.emailVerification}</Typography>
			<div style={{margin: '10px'}} />
			{  requestAnotherValidationTokenButton }
		</div>
	);
}

export default ConfirmEmail;
