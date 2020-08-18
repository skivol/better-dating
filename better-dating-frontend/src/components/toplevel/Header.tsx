import * as React from "react";
import { useDispatch } from "react-redux";
import { useRouter } from 'next/router';
import {
	AppBar, Toolbar, IconButton,
	Button, Typography, Slide, SwipeableDrawer,
	useScrollTrigger,
	List, ListItem, ListItemProps, ListItemIcon, ListItemText,
	Menu, MenuItem, MenuItemProps
} from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faUserPlus, faUserCircle, faBars, faIdCard, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { makeStyles } from '@material-ui/core/styles';
import Link from 'next/link';

import * as actions from '../../actions';
import { SpinnerAdornment as Spinner } from '../common';
import * as Messages from '../Messages';
import { fromPage, proposal, registerAccount, profile, login } from '../navigation/NavigationUrls';
// @ts-ignore
import SmotrinyLogo from '../img/logo.svg';
import { useUser } from '../../utils';

const logoStyle: React.CSSProperties = {
	height: 50,
	width: 50,
	background: 'white',
	borderRadius: 10,
};

const useStyles = makeStyles((theme) => ({
	marginRight: {
		marginRight: theme.spacing(2),
	},
	title: {
		flexGrow: 1,
	},
}));

interface Props {
	children: React.ReactElement;
}

// https://material-ui.com/ru/components/app-bar/#hide-app-bar
function HideOnScroll(props: Props) {
	const { children } = props;
	const trigger = useScrollTrigger();

	return (
		<Slide appear={false} direction="down" in={!trigger}>
			{children}
		</Slide>
	);
}

const ListItemLink = React.forwardRef((props: ListItemProps<'a', { button?: true }>) => {
	return <ListItem button component="a" {...props} />;
});

const MenuItemLink = React.forwardRef((props: MenuItemProps<'a', { button?: true }>) => {
	return <MenuItem button component="a" {...props} />;
});

const Header = () => {
	const classes = useStyles();

	const [drawerOpened, toggleDrawer] = React.useState(false);

	const router = useRouter();
	const userVisiblePath = fromPage(router.pathname);

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
	const handleClose = () => setAnchorEl(null);

	const user = useUser();
	const dispatch = useDispatch();
	let loadingOrLoginButtonOrUserMenu;
	if (user.loading) {
		loadingOrLoginButtonOrUserMenu = <Spinner />;
	} else if (!user.loading && user.id) {
		const onLogoutClick = () => {
			handleClose();
			dispatch(actions.logout()).then(() => router.push("/"));
		};
		loadingOrLoginButtonOrUserMenu = (
			<div>
				<IconButton
					aria-label="account of current user"
					aria-controls="menu-appbar"
					aria-haspopup="true"
					onClick={handleMenu}
					color="inherit"
				>
					<FontAwesomeIcon icon={faUserCircle} />
				</IconButton>
				<Menu
					id="menu-appbar"
					anchorEl={anchorEl}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					keepMounted
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					open={open}
					onClose={handleClose}
				>
					<Link href={profile} passHref>
						<MenuItemLink onClick={handleClose}>
							<ListItemIcon><FontAwesomeIcon icon={faIdCard} /></ListItemIcon>
							<ListItemText>{Messages.Profile}</ListItemText>
						</MenuItemLink>
					</Link>
					<MenuItem onClick={onLogoutClick}>
						<ListItemIcon><FontAwesomeIcon icon={faSignOutAlt} /></ListItemIcon>
						<ListItemText>{Messages.logout}</ListItemText>
					</MenuItem>
				</Menu>
			</div>
		);
	} else {
		loadingOrLoginButtonOrUserMenu = (
			<Link href={login}>
				<Button color="inherit">{Messages.login}</Button>
			</Link>
		);
	}

	return (
		<>
			<HideOnScroll>
				<AppBar>
					<Toolbar>
						<IconButton className={classes.marginRight} edge="start" color="inherit" aria-label="menu" onClick={() => toggleDrawer(true)}>
							<FontAwesomeIcon icon={faBars} />
						</IconButton>
						<img
							src={SmotrinyLogo}
							alt={Messages.logoTooltip}
							style={logoStyle}
							className={classes.marginRight}
						/>
						<Typography variant="h6" className={classes.title} color="inherit">
							{Messages.title}
						</Typography>
						{loadingOrLoginButtonOrUserMenu}
					</Toolbar>
				</AppBar>
			</HideOnScroll>

			<SwipeableDrawer
				anchor="left"
				open={drawerOpened}
				onClose={() => toggleDrawer(false)}
				onOpen={() => toggleDrawer(true)}
			>
				<List style={{ width: 250 }}>
					<Link href={proposal} passHref>
						<ListItemLink selected={userVisiblePath === proposal}>
							<ListItemIcon><FontAwesomeIcon icon={faLightbulb} size="2x" /></ListItemIcon>
							<ListItemText primary={Messages.Idea} />
						</ListItemLink>
					</Link>
					<Link href={registerAccount} passHref>
						<ListItemLink selected={userVisiblePath === registerAccount}>
							<ListItemIcon><FontAwesomeIcon icon={faUserPlus} size="2x" /></ListItemIcon>
							<ListItemText primary={Messages.Registration} />
						</ListItemLink>
					</Link>
				</List>
			</SwipeableDrawer>
		</>
	);
}

export default Header;
