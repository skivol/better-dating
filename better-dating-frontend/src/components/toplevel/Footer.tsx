import * as React from "react";
import * as Messages from '../Messages';

// ©
const Footer = () => (
	<footer className="c-footer u-padding-16px">
		<div className="u-text-align-center">
			{`${Messages.footer} 2019 - ${new Date().getFullYear()}`}
		</div>
	</footer>
);

export default Footer;
