import * as React from "react";
import * as Messages from './Messages';

const footerStyle: React.CSSProperties = {
	textAlign: 'center'
};

const Footer = () => (
	<div style={footerStyle}>
		{ `${Messages.footer} © 2019` }
	</div>
);

export default Footer;
