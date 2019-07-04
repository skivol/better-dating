import { connect } from 'react-redux';
import StatusSnackbar from '../components/StatusSnackbar';
import * as actions from '../actions/';
import { BetterDatingStoreState, BetterDatingThunkDispatch } from '../configureStore';

export const mapStateToProps = ({ snackbar: { isOpen, message, variant }}: BetterDatingStoreState) => ({
	isOpen, message, variant
});

export const mapDispatchToProps = (dispatch: BetterDatingThunkDispatch) => ({
	onClose: () => dispatch(actions.closeSnackbar()),
});

export default connect(mapStateToProps, mapDispatchToProps)(StatusSnackbar);
