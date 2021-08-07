import { Menu, MenuItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faEye } from "@fortawesome/free-regular-svg-icons";
import { faCheckDouble, faUserCheck } from "@fortawesome/free-solid-svg-icons";
import { SpinnerAdornment as Spinner } from "../common";
import * as Messages from "../Messages";

export const DateMenu = ({
  otherUserNickname,
  anchorEl,
  menuIsOpen,
  closeMenu,
  onClick,
  checkingIn,
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
    <MenuItem disabled={checkingIn} onClick={() => onClick("check-in")}>
      <ListItemIcon className="u-min-width-30px">
        {checkingIn ? (
          <Spinner color="lightgray" />
        ) : (
          <FontAwesomeIcon icon={faCalendarCheck} />
        )}
      </ListItemIcon>
      <ListItemText>{Messages.checkIn}</ListItemText>
    </MenuItem>
    <MenuItem onClick={() => onClick("verify-date")}>
      <ListItemIcon className="u-min-width-30px">
        <FontAwesomeIcon icon={faCheckDouble} />
      </ListItemIcon>
      <ListItemText>{Messages.verifyDate}</ListItemText>
    </MenuItem>
    <MenuItem onClick={() => onClick("evaluate-profile")}>
      <ListItemIcon className="u-min-width-30px">
        <FontAwesomeIcon icon={faUserCheck} />
      </ListItemIcon>
      <ListItemText>
        {Messages.evaluateProfileMenu(otherUserNickname)}
      </ListItemText>
    </MenuItem>
    <MenuItem onClick={() => onClick("view-profile-evaluation")}>
      <ListItemIcon className="u-min-width-30px">
        <FontAwesomeIcon icon={faEye} />
      </ListItemIcon>
      <ListItemText>{Messages.viewProfileEvaluationMenu}</ListItemText>
    </MenuItem>
  </Menu>
);
