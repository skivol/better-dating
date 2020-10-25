import { Field } from "react-final-form";
import { validatePersonalHealthEvaluation } from "../../utils/ValidationUtils";
import * as Messages from "../Messages";
import RatingAdapter from "./RatingAdapter";

// Личная оценка состояния физического и психического здоровья (1 - 10)
export const PersonalHealthEvaluation = ({ readonly }: any) => (
  <Field
    disabled={readonly}
    name="personalHealthEvaluation"
    label={Messages.personalHealthEvaluation}
    component={RatingAdapter}
    validate={validatePersonalHealthEvaluation}
  />
);
