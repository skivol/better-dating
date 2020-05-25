import { connect } from 'react-redux';
import { BetterDatingThunkDispatch } from '../configureStore';
import * as actions from '../actions';
import { RegisterAccountForm, IDispatchProps } from '../components/RegisterAccountForm';
import { SnackbarVariant } from '../types';
import * as Messages from './Messages';


export const mapDispatchToProps = (dispatch: BetterDatingThunkDispatch): IDispatchProps => ({
    onSubmit: (values) => dispatch(actions.createAccount(values)),
    onCouldNotCheckIfAlreadyPresentEmail: () => dispatch(actions.openSnackbar(Messages.couldNotCheckIfAlreadyPresentEmail, SnackbarVariant.error))
});

export default connect(null, mapDispatchToProps)(RegisterAccountForm);
