import * as React from "react";
import clsx from 'clsx';
import { NavLink } from 'react-router-dom';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import NavigationUrls from './NavigationUrls';
import * as Messages from './Messages';
import Icon from '@material-ui/core/Icon';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    width: '100%',
  },
  icon: {
    margin: theme.spacing(2),
  },
}));

// material-ui + React Router => https://stackoverflow.com/a/51234539
const Navigation = () => {
	const classes = useStyles();
	return (
		<BottomNavigation
			className={classes.root}
			showLabels
		>
			<BottomNavigationAction
				component={NavLink}
				to={NavigationUrls.proposalUrl}
				label={Messages.Proposal}
				value={Messages.Proposal}
				icon={<Icon className={clsx(classes.icon, 'far fa-lightbulb')} />}
				// icon={<Icon>help_outline</Icon>}
			/>
		</BottomNavigation>
	);
};

export default Navigation;
