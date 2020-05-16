import { connect } from 'react-redux';
import * as actions from '../actions';
import { EmailForm, IDispatchProps } from '../components/EmailForm';
import { BetterDatingThunkDispatch } from '../configureStore';
import { SnackbarVariant } from '../types';
import * as Messages from './Messages';

export const mapDispatchToProps = (dispatch: BetterDatingThunkDispatch): IDispatchProps => ({
	onSubmit: (values) => dispatch(actions.submitEmail(values)),
	onCouldNotCheckIfAlreadyPresentEmail: () => dispatch(actions.openSnackbar(Messages.couldNotCheckIfAlreadyPresentEmail, SnackbarVariant.error))
});

export default connect(null, mapDispatchToProps)(EmailForm);

