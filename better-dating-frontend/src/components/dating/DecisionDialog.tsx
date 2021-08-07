import { Form } from "react-final-form";
import {
  Grid,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { Select } from "mui-rff";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandshake } from "@fortawesome/free-regular-svg-icons";
import {
  topRightPosition,
  required,
  ReactMarkdownMaterialUi,
} from "../../utils";
import { SpinnerAdornment as Spinner, PaperGrid } from "../common";
import * as Messages from "./Messages";

const decisionOptions = [
  {
    label: Messages.wantToContinueRelationshipsAndCreateFamily,
    value: "WantToContinueRelationshipsAndCreateFamily",
  },
  {
    label: Messages.doNotKnow,
    value: "DoNotKnow",
  },
  {
    label: Messages.doNotWant,
    value: "DoNotWant",
  },
];
export const DecisionDialog = ({
  closeDialog,
  onDecide,
  loading,
  data: { decision = null } = {},
}: any) => (
  <Dialog
    open
    onClose={closeDialog}
    PaperProps={{ className: "u-min-width-450px" }}
  >
    <DialogContent dividers={false}>
      <DialogTitle>
        <Typography variant="h4">{Messages.decisionOnCurrentPair}</Typography>
        <IconButton
          aria-label="close"
          style={topRightPosition}
          onClick={closeDialog}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <Form
        initialValues={decision ? { decision } : null}
        onSubmit={onDecide}
        render={({ handleSubmit, pristine }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Grid
                container
                direction="column"
                className="u-padding-10px u-max-width-650px u-center-horizontally"
                spacing={2}
              >
                <Grid item>
                  <Alert severity="info">
                    <ReactMarkdownMaterialUi>
                      {Messages.decideOnPairInfo}
                    </ReactMarkdownMaterialUi>
                  </Alert>
                </Grid>
                <PaperGrid noMaxWidth>
                  <Select
                    disabled={decision !== null}
                    fieldProps={{ validate: required }}
                    name="decision"
                    label={Messages.decisionLabel}
                    data={decisionOptions}
                  />
                </PaperGrid>
                {decision === null && (
                  <Button
                    style={{ marginLeft: "auto" }}
                    color="primary"
                    type="submit"
                    disabled={pristine || loading}
                    startIcon={
                      loading ? (
                        <Spinner color="lightgray" />
                      ) : (
                        <FontAwesomeIcon icon={faHandshake} />
                      )
                    }
                  >
                    {Messages.decide}
                  </Button>
                )}
              </Grid>
            </form>
          );
        }}
      />
    </DialogContent>
  </Dialog>
);
