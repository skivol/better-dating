import { Form } from "react-final-form";
import {
  Grid,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { TextField, Select } from "mui-rff";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons";
import {
  ReactMarkdownMaterialUi,
  required,
  validateExplanationComment,
  topRightPosition,
} from "../../utils";
import { SpinnerAdornment as Spinner, PaperGrid } from "../common";
import * as Messages from "../Messages";

const evaluationCategoryOptions = [
  {
    label: Messages.credibleEnoughInformation,
    value: "CredibleEnoughInformation",
  },
  {
    label: Messages.somethingSeemsWrong,
    value: "SomethingSeemsWrong",
  },
  {
    label: Messages.somePartsAreDefinitelyWrong,
    value: "SomePartsAreDefinitelyWrong",
  },
];
const improvementCategoryOptions = [
  {
    label: Messages.looksGoodToMe,
    value: "LooksGoodToMe",
  },
  {
    label: Messages.somethingCouldBeImprovedButNotSureWhat,
    value: "SomethingCouldBeImprovedButNotSureWhat",
  },
  {
    label: Messages.someThingsCanBeImproved,
    value: "SomeThingsCanBeImproved",
  },
];

export const EvaluateProfileDialog = ({
  readonly = false,
  data: { credibility = null, improvement = null } = {},
  closeDialog,
  onEvaluate,
  evaluating,
}: any) => (
  <Dialog
    open
    onClose={closeDialog}
    scroll="body"
    aria-describedby="scroll-dialog-description"
    PaperProps={{ className: "u-max-width-500px" }}
  >
    <DialogContent dividers={false}>
      <DialogTitle>
        <Typography variant="h4">
          {readonly
            ? Messages.viewProfileEvaluation
            : Messages.evaluateProfileTruthfullnessAndSuggestImprovement}
        </Typography>
        <IconButton
          aria-label="close"
          style={topRightPosition}
          onClick={closeDialog}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <Form
        initialValues={
          credibility
            ? {
                credibilityCategory: credibility.category,
                credibilityExplanationComment: credibility.comment,
                improvementCategory: improvement.category,
                improvementExplanationComment: improvement.comment,
              }
            : null
        }
        onSubmit={onEvaluate}
        render={({
          handleSubmit,
          pristine,
          values: { credibilityCategory, improvementCategory },
        }) => {
          const credibilityCommentRequired =
            credibilityCategory &&
            credibilityCategory !== "CredibleEnoughInformation";
          const improvementCommentRequired =
            improvementCategory && improvementCategory !== "LooksGoodToMe";
          return (
            <form onSubmit={handleSubmit}>
              <Grid
                container
                direction="column"
                className="u-padding-10px u-max-width-500px u-center-horizontally"
                spacing={2}
              >
                <Grid item>
                  <Alert severity="info">
                    <ReactMarkdownMaterialUi>
                      {Messages.evaluateProfileTruthfullnessInfo}
                    </ReactMarkdownMaterialUi>
                  </Alert>
                </Grid>
                <PaperGrid>
                  <Select
                    disabled={readonly}
                    fieldProps={{ validate: required }}
                    name="credibilityCategory"
                    label={Messages.credibilityEvaluationLabel}
                    data={evaluationCategoryOptions}
                  />
                </PaperGrid>
                {credibilityCommentRequired && (
                  <PaperGrid>
                    <TextField
                      disabled={readonly}
                      required={credibilityCommentRequired}
                      label={Messages.credibilityComment}
                      name="credibilityExplanationComment"
                      multiline
                      helperText={
                        Messages.moreDetailedCredibilityEvaluationReasoning
                      }
                      fieldProps={{
                        validate: validateExplanationComment,
                      }}
                    />
                  </PaperGrid>
                )}
                <Grid item>
                  <Alert severity="info">
                    <ReactMarkdownMaterialUi>
                      {Messages.suggestProfileImprovementInfo}
                    </ReactMarkdownMaterialUi>
                  </Alert>
                </Grid>
                <PaperGrid>
                  <Select
                    disabled={readonly}
                    fieldProps={{ validate: required }}
                    name="improvementCategory"
                    label={Messages.improvementLabel}
                    data={improvementCategoryOptions}
                  />
                </PaperGrid>
                {improvementCommentRequired && (
                  <PaperGrid>
                    <TextField
                      disabled={readonly}
                      required={improvementCommentRequired}
                      label={Messages.improvementComment}
                      name="improvementExplanationComment"
                      multiline
                      helperText={Messages.moreDetailedImprovementReasoning}
                      fieldProps={{
                        validate: validateExplanationComment,
                      }}
                    />
                  </PaperGrid>
                )}
                {!readonly && (
                  <Grid item className="u-display-flex">
                    <Button
                      style={{ marginLeft: "auto" }}
                      color="primary"
                      type="submit"
                      disabled={pristine || evaluating}
                      startIcon={
                        evaluating ? (
                          <Spinner color="lightgray" />
                        ) : (
                          <FontAwesomeIcon icon={faUserCheck} />
                        )
                      }
                    >
                      {Messages.sendEvaluation}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </form>
          );
        }}
      />
    </DialogContent>
  </Dialog>
);
