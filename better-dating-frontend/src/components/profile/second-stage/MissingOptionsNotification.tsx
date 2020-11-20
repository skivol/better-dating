import Alert from "@material-ui/lab/Alert";
import * as Messages from "./Messages";

export const MissingOptionsNotification = () => (
  <Alert severity="info">{Messages.missingOptionsNotification}</Alert>
);
