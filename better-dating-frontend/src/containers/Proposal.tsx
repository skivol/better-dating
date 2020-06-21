import { connect } from 'react-redux';
import { BetterDatingThunkDispatch } from '../configureStore';
import * as actions from '../actions';
import { Proposal, IDispatchProps } from '../components/Proposal';


export const mapDispatchToProps = (dispatch: BetterDatingThunkDispatch): IDispatchProps => ({
    onLoginLink: (email: string) => dispatch(actions.requestLogin(email)),
});

export default connect(null, mapDispatchToProps)(Proposal);
