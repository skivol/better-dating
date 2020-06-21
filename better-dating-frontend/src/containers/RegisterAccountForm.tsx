import { connect } from 'react-redux';
import { BetterDatingThunkDispatch } from '../configureStore';
import * as actions from '../actions';
import { RegisterAccountForm, IDispatchProps } from '../components/RegisterAccountForm';


export const mapDispatchToProps = (dispatch: BetterDatingThunkDispatch): IDispatchProps => ({
    onSubmit: (values) => dispatch(actions.createAccount(values)),
});

export default connect(null, mapDispatchToProps)(RegisterAccountForm);
