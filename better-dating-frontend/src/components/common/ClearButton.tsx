import { Fab } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import * as Messages from "./Messages";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      marginRight: theme.spacing(1),
    },
  })
);

type Props = {
  onClick: () => void;
};
export const ClearButton = ({ onClick }: Props) => {
  const classes = useStyles();
  return (
    <div className="c-clear-button">
      <Fab variant="extended" onClick={onClick}>
        <FontAwesomeIcon className={classes.icon} icon={faTrashAlt} />
        {Messages.clear}
      </Fab>
    </div>
  );
};
