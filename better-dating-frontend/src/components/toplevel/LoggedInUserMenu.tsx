import React from "react";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch } from "react-redux";
import {
    IconButton, ListItemIcon, ListItemText,
    Menu, MenuItem, MenuItemProps
} from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faIdCard, faTools, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { profile, administration } from '../navigation/NavigationUrls';
import { useMenu } from '../../utils';
import { UserState } from '../../types';
import * as actions from '../../actions';
import * as Messages from '../Messages';


const MenuItemLink = React.forwardRef((props: MenuItemProps<'a', { button?: true }>) => {
    return <MenuItem button component="a" {...props} />;
});

type Props = {
    user: UserState;
};
export const LoggedInUserMenu = ({ user }: Props) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { anchorEl, menuIsOpen, openMenu, closeMenu } = useMenu();
    const onLogoutClick = () => {
        closeMenu();
        dispatch(actions.logout()).then(() => router.push("/"));
    };
    const isAdmin = user.roles.includes("ROLE_ADMIN");

    return (
        <div>
            <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={openMenu}
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
                open={menuIsOpen}
                onClose={closeMenu}
            >
                <Link href={profile} passHref>
                    <MenuItemLink onClick={closeMenu}>
                        <ListItemIcon className="u-min-width-30px"><FontAwesomeIcon icon={faIdCard} /></ListItemIcon>
                        <ListItemText>{Messages.Profile}</ListItemText>
                    </MenuItemLink>
                </Link>
                {isAdmin && (<Link href={administration} passHref>
                    <MenuItemLink onClick={closeMenu}>
                        <ListItemIcon className="u-min-width-30px"><FontAwesomeIcon icon={faTools} /></ListItemIcon>
                        <ListItemText>{Messages.Administration}</ListItemText>
                    </MenuItemLink>
                </Link>)}
                <MenuItem onClick={onLogoutClick}>
                    <ListItemIcon className="u-min-width-30px"><FontAwesomeIcon icon={faSignOutAlt} /></ListItemIcon>
                    <ListItemText>{Messages.logout}</ListItemText>
                </MenuItem>
            </Menu>
        </div>
    );
};
