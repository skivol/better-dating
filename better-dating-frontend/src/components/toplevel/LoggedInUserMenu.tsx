import { forwardRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuItemProps,
} from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faIdCard,
  faUserFriends,
  faTools,
  faSignOutAlt,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import {
  profile,
  dating,
  administration,
  events,
} from "../navigation/NavigationUrls";
import { useMenu, isAdmin } from "../../utils";
import { UserState } from "../../types";
import * as actions from "../../actions";
import * as Messages from "../Messages";

type MenuItemLinkProps = MenuItemProps<"a", { button?: true }> & {
  href: string;
};
// eslint-disable-next-line react/display-name
const MenuItemLink = forwardRef(
  ({ href, onClick, ...rest }: MenuItemLinkProps, ref) => {
    return (
      <Link href={href} passHref>
        <MenuItem button component="a" onClick={onClick} {...rest} />
      </Link>
    );
  }
);

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
  const secondStageEnabled = user.secondStageEnabled;

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
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={menuIsOpen}
        onClose={closeMenu}
      >
        <MenuItemLink onClick={closeMenu} href={profile}>
          <ListItemIcon className="u-min-width-30px">
            <FontAwesomeIcon icon={faIdCard} />
          </ListItemIcon>
          <ListItemText>{Messages.Profile}</ListItemText>
        </MenuItemLink>
        {secondStageEnabled && (
          <MenuItemLink onClick={closeMenu} href={dating}>
            <ListItemIcon className="u-min-width-30px">
              <FontAwesomeIcon icon={faUserFriends} />
            </ListItemIcon>
            <ListItemText>{Messages.PairsAndDates}</ListItemText>
          </MenuItemLink>
        )}
        {isAdmin(user) && (
          <MenuItemLink onClick={closeMenu} href={administration}>
            <ListItemIcon className="u-min-width-30px">
              <FontAwesomeIcon icon={faTools} />
            </ListItemIcon>
            <ListItemText>{Messages.Administration}</ListItemText>
          </MenuItemLink>
        )}
        <MenuItemLink onClick={closeMenu} href={events}>
          <ListItemIcon className="u-min-width-30px">
            <FontAwesomeIcon icon={faHistory} />
          </ListItemIcon>
          <ListItemText>{Messages.Events}</ListItemText>
        </MenuItemLink>
        <MenuItem onClick={onLogoutClick}>
          <ListItemIcon className="u-min-width-30px">
            <FontAwesomeIcon icon={faSignOutAlt} />
          </ListItemIcon>
          <ListItemText>{Messages.logout}</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
};
