import { connect } from 'react-redux';
import { reduxForm, isInvalid } from 'redux-form';
import { EMAIL_FORM_ID } from '../constants';
import * as actions from '../actions';
import { SnackbarVariant } from '../types';
import EmailForm from '../components/EmailForm';
import { getData } from '../FetchUtils';
import { BetterDatingStoreState, BetterDatingThunkDispatch } from '../configureStore';
import * as Messages from './Messages';

const validate = (values: any) => {
	const errors: any = {};
	const requiredFields = [ 'email' ];
	requiredFields.forEach(field => {
		if (!values[field]) {
			errors[field] = Messages.requiredField;
		}
	});
	// TODO support cyrillyc letters in email ?
	if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
		errors.email = Messages.invalidFormat;
	}
	return errors;
};

function checkIfEmailIsAlreadyPresent(email: string) {
	const someEmail = email !== '';
	if (!someEmail) {
		return Promise.resolve(false);
	}
	return getData('/api/user/email/status', { email });
}
const asyncValidate = (values: any, dispatch: (action: actions.BetterDatingAction) => void) => {
	return checkIfEmailIsAlreadyPresent(values.email)
		.catch(
			(error) => {
				dispatch(actions.openSnackbar(Messages.couldNotCheckIfAlreadyPresentEmail, SnackbarVariant.error));
				return { used: false };
			}
		).then(({ used }: any) => {
			if (used) {
				throw { email: Messages.alreadyPresentEmail };
			}
		});
};

export const mapStateToProps = (state: BetterDatingStoreState) => ({
	isInvalid: () => isInvalid(EMAIL_FORM_ID)(state)
});

export const mapDispatchToProps = (dispatch: BetterDatingThunkDispatch) => ({});

export default reduxForm({
  form: EMAIL_FORM_ID,
  validate,
  asyncValidate
})(connect(mapStateToProps, mapDispatchToProps)(EmailForm));

