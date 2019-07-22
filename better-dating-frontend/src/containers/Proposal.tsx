import { connect } from 'react-redux';
import Proposal from '../components/Proposal';
import * as actions from '../actions/';
import { BetterDatingStoreState, BetterDatingThunkDispatch } from '../configureStore';

export const mapStateToProps = (state: BetterDatingStoreState) => ({});

export const mapDispatchToProps = (dispatch: BetterDatingThunkDispatch) => ({
	onEmailSubmit: () => dispatch(actions.submitEmail()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Proposal);
