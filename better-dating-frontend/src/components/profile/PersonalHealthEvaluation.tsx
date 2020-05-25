import * as React from "react";
import { Field } from 'react-final-form';
import { validatePersonalHealthEvaluation } from '../../utils/ValidationUtils';
import * as Messages from '../Messages';
import RatingAdapter from './RatingAdapter';

// Личная оценка состояния физического и психического здоровья (1 - 10)
const PersonalHealthEvaluation = () => (
    <Field
        name="personalHealthEvaluation"
        label={Messages.personalHealthEvaluation}
        component={RatingAdapter}
        validate={validatePersonalHealthEvaluation}
    />
);

export default PersonalHealthEvaluation;
