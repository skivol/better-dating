import * as React from "react";
import * as Messages from './Messages';

// https://stackoverflow.com/a/18915680
const footerStyle: React.CSSProperties = {
	position: 'fixed',
	bottom: '0px',
	left: '0px',
	right: '0px',
	background: 'white',
	zIndex: 100,
	padding: '16px',
	marginTop: 'auto',
};
const footerContentStyle: React.CSSProperties = {
	textAlign: 'center',
};

// ©
const Footer = () => (
	<footer style={footerStyle}>
		<div style={footerContentStyle}>
			{ `${Messages.footer} 2019` }
		</div>
	</footer>
);

export default Footer;
