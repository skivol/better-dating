import * as Messages from '../Messages';

export const proposal = `/${Messages.proposal}`;
export const registerAccount = '/регистрация';
export const technologies = '/технологии';

export const fromPage = (actualPagePath: string) => {
	const mapping: { [index: string]: string } = {
		["/"]: proposal,
		["/proposal"]: proposal,
		["/register-account"]: registerAccount,
		["/technologies"]: technologies
	};
	return mapping[actualPagePath];
};

export const toPage = (userVisiblePath: string) => {
	const mapping: { [index: string]: string } = {
		["/"]: "/proposal",
		[proposal]: "/proposal",
		[registerAccount]: "/register-account",
		[technologies]: "/technologies"
	};
	return mapping[userVisiblePath];
};
