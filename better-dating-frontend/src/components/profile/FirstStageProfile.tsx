import { Grid } from "@material-ui/core";
import {
  Email,
  Nickname,
  Gender,
  Birthday,
  Height,
  Weight,
  AnalyzedSection,
  PersonalHealthEvaluation,
  renderActions,
} from ".";

export const FirstStageProfile = ({ readonly, values, showAnalysis }: any) => (
  <Grid container direction="column" className="u-padding-10px" spacing={2}>
    {!readonly && <Email />}
    <Nickname readonly={readonly} />
    <Gender readonly={readonly} />
    <Birthday id="birthday" readonly={readonly} />

    <AnalyzedSection
      id="height-weight-analyze"
      type="height-weight"
      values={values}
      visible={showAnalysis}
    >
      <Height readonly={readonly} />
      <Weight readonly={readonly} />
    </AnalyzedSection>

    {renderActions(values, showAnalysis, readonly)}
    <AnalyzedSection type="summary" values={values} visible={showAnalysis}>
      <PersonalHealthEvaluation readonly={readonly} />
    </AnalyzedSection>
  </Grid>
);
