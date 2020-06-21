import * as Messages from '../Messages';

export const proposal = `/${Messages.proposal}`;
export const registerAccount = '/регистрация';
export const profile = '/профиль';
export const acknowledgements = '/благодарности';
export const privacyPolicy = '/политика-конфиденциальности';
export const userAgreement = '/пользовательское-соглашение';

export const fromPage = (actualPagePath: string) => {
	const mapping: { [index: string]: string } = {
		["/"]: proposal,
		["/proposal"]: proposal,
		["/register-account"]: registerAccount,
		["/profile"]: profile,
		["/acknowledgements"]: acknowledgements,
		["/privacy-policy"]: privacyPolicy,
		["/user-agreement"]: userAgreement,
	};
	return mapping[actualPagePath];
};

export const toPage = (userVisiblePath: string) => {
	const mapping: { [index: string]: string } = {
		["/"]: "/proposal",
		[proposal]: "/proposal",
		[registerAccount]: "/register-account",
		[profile]: "/profile",
		[acknowledgements]: "/acknowledgements",
		[privacyPolicy]: "/privacy-policy",
		[userAgreement]: "/user-agreement",
	};
	return mapping[userVisiblePath];
};
