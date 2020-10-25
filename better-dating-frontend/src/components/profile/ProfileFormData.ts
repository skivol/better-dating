export interface ProfileFormData {
  email?: string;
  nickname?: string;
  gender?: string;
  bday?: string;
  height?: number;
  weight?: number;
  physicalExercise?: string;
  smoking?: string;
  alcohol?: string;
  computerGames?: string;
  gambling?: string;
  haircut?: string;
  hairColoring?: string;
  makeup?: string;
  intimateRelationsOutsideOfMarriage?: string;
  pornographyWatching?: string;
  personalHealthEvaluation: number;
}

export const defaultValues = {
  email: undefined,
  nickname: undefined,
  gender: undefined,
  bday: undefined,
  height: undefined,
  weight: undefined,
  physicalExercise: undefined,
  smoking: undefined,
  alcohol: undefined,
  computerGames: undefined,
  gambling: undefined,
  haircut: undefined,
  hairColoring: undefined,
  makeup: undefined,
  intimateRelationsOutsideOfMarriage: undefined,
  pornographyWatching: undefined,
  personalHealthEvaluation: -1,
};
