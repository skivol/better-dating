import { connect } from 'react-redux';
import { BetterDatingThunkDispatch } from '../configureStore';
import * as actions from '../actions';
import { Profile, IDispatchProps } from '../components/Profile';
import { emailHasChanged } from '../utils';


export const mapDispatchToProps = (dispatch: BetterDatingThunkDispatch): IDispatchProps => ({
    onSubmit: (values, form, doAfter) => dispatch(actions.updateAccount(values, emailHasChanged(form), doAfter)),
    requestProfileRemoval: () => dispatch(actions.requestAccountRemoval()),
});

export default connect(null, mapDispatchToProps)(Profile);
