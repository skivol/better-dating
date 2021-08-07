import {
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { ReactMarkdownMaterialUi, topRightPosition } from "../../utils";
import * as Messages from "../Messages";

export const AdvicesDialog = ({ closeDialog }: any) => (
  <Dialog
    open
    onClose={closeDialog}
    scroll="body"
    aria-describedby="scroll-dialog-description"
    PaperProps={{ className: "u-max-width-800px" }}
  >
    <DialogContent dividers={false}>
      <DialogTitle>
        <Typography variant="h6">
          {Messages.dateIsOrganizedWhatIsNextTitle}
        </Typography>
        <IconButton
          aria-label="close"
          style={topRightPosition}
          onClick={closeDialog}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <ReactMarkdownMaterialUi>
        {Messages.dateIsOrganizedWhatIsNext}
      </ReactMarkdownMaterialUi>
    </DialogContent>
  </Dialog>
);
