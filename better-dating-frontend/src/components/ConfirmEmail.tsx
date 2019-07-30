import * as React from "react";
import { withRouter } from "react-router";
import { RouteComponentProps } from "react-router";
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import * as Messages from './Messages';

// https://stackoverflow.com/questions/48219432/react-router-typescript-errors-on-withrouter-after-updating-version
type PathParamsType = {
}

type Props = RouteComponentProps<PathParamsType> & {
	location: any;
	onEmailVerify: (token: string) => void;
	onNoTokenProvided: () => void;
	hasExpiredToken: boolean;
	onRequestAnotherValidationToken: (prevToken: string) => any;
	history: any;
}

const ConfirmEmail = ({ location: { search }, onEmailVerify, onNoTokenProvided, hasExpiredToken, onRequestAnotherValidationToken, history }: Props) => {
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
	const backToMain = (
		<Button variant="contained" color="primary" onClick={() => history.push("/")}>
			{Messages.backToMain}
		</Button>
	);
	return (
		<div style={{height: '120px', textAlign: 'center', marginTop: '15px'}}>
			<Typography variant="h3">{Messages.emailVerification}</Typography>
			<div style={{margin: '10px'}} />
			{ requestAnotherValidationTokenButton || backToMain }
		</div>
	);
}

export default withRouter(ConfirmEmail);
