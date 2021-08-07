import { Menu, MenuItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBinoculars } from "@fortawesome/free-solid-svg-icons";
import { faHandshake } from "@fortawesome/free-regular-svg-icons";
import * as Messages from "./Messages";

export const PairMenu = ({
  anchorEl,
  menuIsOpen,
  closeMenu,
  onViewOtherUserProfile,
  viewOtherUserProfileTitle,
  onDecisionDialog,
}: any) => (
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
    <MenuItem onClick={onViewOtherUserProfile}>
      <ListItemIcon className="u-min-width-30px">
        <FontAwesomeIcon icon={faBinoculars} />
      </ListItemIcon>
      <ListItemText>{viewOtherUserProfileTitle}</ListItemText>
    </MenuItem>
    <MenuItem onClick={onDecisionDialog}>
      <ListItemIcon className="u-min-width-30px">
        <FontAwesomeIcon icon={faHandshake} />
      </ListItemIcon>
      <ListItemText>{Messages.decision}</ListItemText>
    </MenuItem>
  </Menu>
);
