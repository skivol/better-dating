import { connect } from 'react-redux';
import ConfirmEmail from '../components/ConfirmEmail';
import { SnackbarVariant } from '../types';
import * as actions from '../actions/';
import { resolveTokenMessage, successVerifyingEmailMessage } from '../Messages';
import { BetterDatingThunkDispatch } from '../configureStore';

export const mapDispatchToProps = (dispatch: BetterDatingThunkDispatch) => ({
	onRequestAnotherValidationToken: (previousToken: string) => dispatch(actions.requestAnotherValidationToken(previousToken)),
	onTokenVerified: () => dispatch(actions.openSnackbar(successVerifyingEmailMessage, SnackbarVariant.success)),
	onErrorVerifying: (errorMessage: string) => dispatch(actions.openSnackbar(resolveTokenMessage(errorMessage), SnackbarVariant.error))
});

export default connect(null, mapDispatchToProps)(ConfirmEmail);
