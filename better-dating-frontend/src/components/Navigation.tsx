import * as React from "react";
import { NavLink } from 'react-router-dom';
import NavigationUrls from './NavigationUrls';
import Messages from './Messages';

const Navigation = () => {
	return (
		<nav>
			<ul>
				<li><NavLink to={NavigationUrls.motivationUrl}>{Messages.Motivation}</NavLink></li>
			</ul>
		</nav>
	);
};

export default Navigation;
