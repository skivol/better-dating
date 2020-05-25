import { connect } from 'react-redux';
import { BetterDatingThunkDispatch } from '../configureStore';
import * as actions from '../actions';
import { Profile, IDispatchProps } from '../components/Profile';
import { SnackbarVariant } from '../types';
import { emailHasChanged } from '../utils/FormUtils';
import * as Messages from './Messages';


export const mapDispatchToProps = (dispatch: BetterDatingThunkDispatch): IDispatchProps => ({
    onSubmit: (values, form, doAfter) => dispatch(actions.updateAccount(values, emailHasChanged(form), doAfter)),
    onCouldNotCheckIfAlreadyPresentEmail: () => dispatch(actions.openSnackbar(Messages.couldNotCheckIfAlreadyPresentEmail, SnackbarVariant.error)),
});

export default connect(null, mapDispatchToProps)(Profile);

