import { Select } from "mui-rff";
import {
  physicalExerciseOptions,
  smokingOptions,
  alcoholOptions,
  computerGamesOptions,
  gamblingOptions,
  haircutOptions,
  hairColoringOptions,
  makeupOptions,
  intimateRelationsOutsideOfMarriageOptions,
  pornographyWatchingOptions,
  required,
} from "../../utils";
import { PaperGrid } from "../common";
import * as Messages from "../Messages";
import { AnalyzedSection } from ".";

const actions = [
  {
    /* Физкультура / физические упражнения */ analysisType: "physicalExercise",
    validate: required,
    required: true,
    name: "physicalExercise",
    label: Messages.physicalExercise,
    data: physicalExerciseOptions,
  },
  {
    /* Курение и его разновидности (сигареты, вайп, снус, кальян) (частота) */
    analysisType: "smoking",
    validate: required,
    required: true,
    name: "smoking",
    label: Messages.smoking,
    data: smokingOptions,
    helperText: Messages.smokingInfo,
  },
  {
    /* Алкоголь */ analysisType: "alcohol",
    validate: required,
    required: true,
    name: "alcohol",
    label: Messages.alcohol,
    data: alcoholOptions,
  },
  {
    /* Компьютерные игры */ analysisType: "computerGames",
    validate: required,
    required: true,
    name: "computerGames",
    label: Messages.computerGames,
    data: computerGamesOptions,
  },
  {
    /* Азартные игры */ analysisType: "gambling",
    validate: required,
    required: true,
    name: "gambling",
    label: Messages.gambling,
    data: gamblingOptions,
    helperText: Messages.gamblingInfo,
  },
  {
    /* Стрижка */ analysisType: "haircut",
    validate: required,
    required: true,
    name: "haircut",
    label: Messages.haircut,
    data: haircutOptions,
  },
  {
    /* Окрашивание волос */ analysisType: "hairColoring",
    validate: required,
    required: true,
    name: "hairColoring",
    label: Messages.hairColoring,
    data: hairColoringOptions,
  },
  {
    /* Макияж */ analysisType: "makeup",
    validate: required,
    required: true,
    name: "makeup",
    label: Messages.makeup,
    data: makeupOptions,
  },
  {
    /* Интимные отношения (телегония) */
    analysisType: "intimateRelationsOutsideOfMarriage",
    name: "intimateRelationsOutsideOfMarriage",
    label: Messages.intimateRelationsOutsideOfMarriage,
    data: intimateRelationsOutsideOfMarriageOptions,
    helperText: Messages.intimateRelationsInfo,
  },
  {
    /* Просмотр порнографии */ analysisType: "pornographyWatching",
    name: "pornographyWatching",
    label: Messages.pornographyWatching,
    data: pornographyWatchingOptions,
  },
];

// eslint-disable-next-line react/display-name
const actionSelect = (values: any, showAnalysis = false, readonly = false) => ({
  analysisType,
  validate,
  required,
  name,
  label,
  data,
  helperText,
}: any) => (
  <AnalyzedSection
    key={name}
    values={values}
    visible={showAnalysis}
    type={analysisType}
  >
    <PaperGrid>
      <Select
        disabled={readonly}
        required={required}
        fieldProps={{ validate }}
        name={name}
        label={label}
        data={data}
        helperText={helperText}
      />
    </PaperGrid>
  </AnalyzedSection>
);

export const renderActions = (
  values: any,
  showAnalysis: boolean,
  readonly: boolean
) => actions.map(actionSelect(values, showAnalysis, readonly));
