import { Menu, MenuItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck } from "@fortawesome/free-regular-svg-icons";
import * as Messages from "../Messages";

export const DateMenu = ({ anchorEl, menuIsOpen, closeMenu, onClick }: any) => (
  <Menu
    id="date-menu"
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
    <MenuItem onClick={() => onClick("check-in")}>
      <ListItemIcon className="u-min-width-30px">
        <FontAwesomeIcon icon={faCalendarCheck} />
      </ListItemIcon>
      <ListItemText>{Messages.checkIn}</ListItemText>
    </MenuItem>
  </Menu>
);
