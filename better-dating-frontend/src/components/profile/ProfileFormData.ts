export default interface ProfileFormData {
    email?: string;
    gender?: string;
    bday?: Date;
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
