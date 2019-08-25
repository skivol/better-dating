import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import NavigationUrls from './NavigationUrls';
import Proposal from '../containers/Proposal';
import ConfirmEmail from '../containers/ConfirmEmail';

const redirectToProposal = () => (
	<Redirect to={NavigationUrls.proposalUrl} />
);

const Routes = () => (
	<Switch>
		<Route exact path="/" render={redirectToProposal} />
		{/* TODO add used technologies page */}
		{/* TODO add contacts/help page */}
		{/* TODO add questionnaire ? */}
		{/* TODO reference Wikipedia's article and picture: https://ru.wikipedia.org/wiki/Смотрины */}
		<Route path={NavigationUrls.proposalUrl} component={Proposal} />
		<Route path={NavigationUrls.confirmEmail} component={ConfirmEmail} />
		<Route render={redirectToProposal} />
	</Switch>
);

export default Routes;
