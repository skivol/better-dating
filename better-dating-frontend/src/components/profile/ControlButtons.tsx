import { Button, ButtonGroup } from "@material-ui/core";
import { ToggleButton } from "@material-ui/lab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faUserCheck,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import * as Messages from "./Messages";
import { SpinnerAdornment } from "../common";

export const ControlButtons = ({
  classes,
  readonly,
  showAnalysis,
  analysisButtonAvailable,
  setShowAnalysis,
  openMenu,
  saving,
  pristine,
}: any) => (
  <ButtonGroup
    variant="contained"
    size="large"
    className={`${classes.button} u-center-horizontally u-margin-top-bottom`}
  >
    {!readonly && (
      <Button
        color="primary"
        type="submit"
        disabled={pristine || saving}
        startIcon={
          saving ? <SpinnerAdornment /> : <FontAwesomeIcon icon={faSave} />
        }
      >
        {Messages.save}
      </Button>
    )}
    {analysisButtonAvailable && (
      <ToggleButton
        className="u-color-green"
        selected={showAnalysis}
        value="analyze"
        onChange={() => setShowAnalysis(!showAnalysis)}
      >
        <FontAwesomeIcon
          className={`${classes.icon} MuiButton-startIcon`}
          icon={faUserCheck}
        />
        {showAnalysis ? Messages.hideAnalysis : Messages.analyze}
      </ToggleButton>
    )}
    {!readonly && (
      <Button className="u-color-black" onClick={openMenu}>
        <FontAwesomeIcon
          className="MuiButton-startIcon"
          icon={faEllipsisV}
          size="lg"
        />
      </Button>
    )}
  </ButtonGroup>
);
