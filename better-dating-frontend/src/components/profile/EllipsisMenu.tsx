import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLevelUpAlt,
  faUserMinus,
  faBinoculars,
} from "@fortawesome/free-solid-svg-icons";
import * as Messages from "./Messages";

export const EllipsisMenu = ({
  values,
  anchorEl,
  menuIsOpen,
  closeMenu,
  showDialog,
}: any) => (
  <Menu
    id="menu-profile-extra"
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
    {!values.secondStageData && (<Tooltip
      arrow
      title={
        values.eligibleForSecondStage
          ? ""
          : Messages.nonEligibleForSecondStageReason
      }
      placement="top"
    >
      <span>
        <MenuItem
          onClick={() => showDialog("enableSecondStage")}
          disabled={!values.eligibleForSecondStage}
        >
          <ListItemIcon className="u-color-green u-min-width-30px">
            <FontAwesomeIcon
              className="MuiButton-startIcon"
              icon={faLevelUpAlt}
            />
          </ListItemIcon>
          <ListItemText className="u-color-green">
            {Messages.nextLevel}
          </ListItemText>
        </MenuItem>
      </span>
    </Tooltip>
    )}
    <MenuItem onClick={() => showDialog("accountRemoval")}>
      <ListItemIcon className="u-color-red u-min-width-30px">
        <FontAwesomeIcon className="MuiButton-startIcon" icon={faUserMinus} />
      </ListItemIcon>
      <ListItemText className="u-color-red">
        {Messages.removeProfile}
      </ListItemText>
    </MenuItem>
    <MenuItem onClick={() => showDialog("viewAuthorsProfile")}>
      <ListItemIcon className="u-min-width-30px">
        <FontAwesomeIcon className="MuiButton-startIcon" icon={faBinoculars} />
      </ListItemIcon>
      <ListItemText>{Messages.viewAuthorsProfile}</ListItemText>
    </MenuItem>
  </Menu>
);
