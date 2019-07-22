import { connect } from 'react-redux';
import ConfirmEmail from '../components/ConfirmEmail';
import { SnackbarVariant } from '../types';
import * as actions from '../actions/';
import * as Messages from './Messages';
import { BetterDatingStoreState, BetterDatingThunkDispatch } from '../configureStore';

export const mapStateToProps = ({ expiredToken: { hasExpiredToken }}: BetterDatingStoreState) => ({ hasExpiredToken });

export const mapDispatchToProps = (dispatch: BetterDatingThunkDispatch) => ({
	onEmailVerify: (token: string) => dispatch(actions.verifyEmail(token)),
	onNoTokenProvided: () => dispatch(actions.openSnackbar(Messages.noTokenProvided, SnackbarVariant.error)),
	onRequestAnotherValidationToken: (previousToken: string) => dispatch(actions.requestAnotherValidationToken(previousToken))
});

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmEmail);
