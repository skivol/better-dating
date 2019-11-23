import * as React from 'react';
import Enzyme from 'enzyme';
import Proposal from './Proposal';

it('renders the correct text when no enthusiasm level is given', () => {
	const proposal = Enzyme.shallow(<Proposal email='test@host.com' onEmailChange={() => {}} />);
	expect(proposal.find("#email").text()).toEqual('test@host.com');
});

