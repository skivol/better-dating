import * as React from "react";
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { fromPage, toPage, proposal, registerAccount, technologies } from './NavigationUrls';
import * as Messages from '../Messages';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faPen, faTools } from '@fortawesome/free-solid-svg-icons';

const useStyles = makeStyles((theme: Theme) => createStyles({
	icon: {
		margin: theme.spacing(2),
	},
}));

const Navigation = () => {
	const classes = useStyles();
	const router = useRouter();
	const userVisiblePath = fromPage(router.pathname);

	const handleChange = (event: React.ChangeEvent<{}>, newUserPath: string) => {
		router.push(toPage(newUserPath), newUserPath);
	};
	return (
		<BottomNavigation
			value={userVisiblePath} onChange={handleChange}
			className="c-bottom-navigation u-max-width-892px u-center-horizontally"
		>
			<BottomNavigationAction
				label={Messages.Proposal}
				value={proposal}
				icon={<FontAwesomeIcon className={clsx(classes.icon)} icon={faLightbulb} size="lg" />}
			/>
			<BottomNavigationAction
				label={Messages.Registration}
				value={registerAccount}
				icon={<FontAwesomeIcon className={clsx(classes.icon)} icon={faPen} size="lg" />}
			/>
			<BottomNavigationAction
				disabled
				label={Messages.Technologies}
				value={technologies}
				icon={<FontAwesomeIcon className={clsx(classes.icon)} icon={faTools} size="lg" />}
			/>
		</BottomNavigation>
	);
};

export default Navigation;
