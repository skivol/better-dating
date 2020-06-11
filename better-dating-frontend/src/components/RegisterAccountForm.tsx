import * as React from "react";

import { Form } from 'react-final-form';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Grid,
    Typography,
    Paper,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Field } from 'react-final-form';

import { validateEmail } from '../utils/ValidationUtils';
import * as Messages from './Messages';
import TermsOfUserAgreement from './register-account/TermsOfUserAgreement';
import RegistrationFormData, { defaultValues as registrationDataDefaults } from './register-account/RegistrationFormData';
import Email from './profile/Email';
import Gender from './profile/Gender';
import Birthday from './profile/Birthday';
import Height from './profile/Height';
import Weight from './profile/Weight';
import PersonalHealthEvaluation from './profile/PersonalHealthEvaluation';
import { renderActions } from './profile/Actions';
import SubmitButton from './profile/SubmitButton';


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {
            margin: theme.spacing(1),
        }
    })
);

export interface IDispatchProps {
    onSubmit: (data: RegistrationFormData) => void;
    onCouldNotCheckIfAlreadyPresentEmail: () => void;
}

export const RegisterAccountForm = ({ onSubmit, onCouldNotCheckIfAlreadyPresentEmail }: IDispatchProps) => {
    const classes = useStyles();
    const configuredEmailValidation = validateEmail(onCouldNotCheckIfAlreadyPresentEmail);

    return (
        <Form
            initialValues={registrationDataDefaults}
            onSubmit={onSubmit}
            render={({ handleSubmit, pristine, submitting }) => (
                <form onSubmit={handleSubmit}>
                    <Grid
                        container
                        direction="column"
                        className="u-margin-top-bottom-15px u-min-width-450px u-padding-10px"
                        spacing={2}
                    >
                        <Grid item>
                            <Paper elevation={3} className="u-padding-16px u-center-horizontally u-max-width-450px">
                                <div className="u-center-horizontally u-fit-content u-margin-bottom-10px">
                                    <Typography variant="h3" className="u-bold">
                                        {Messages.Registration}
                                    </Typography>
                                </div>
                                <Alert
                                    className="u-max-width-500px u-center-horizontally"
                                    severity="info"
                                >
                                    <Typography>{Messages.willBeHardButFun}</Typography>
                                </Alert>
                            </Paper>
                        </Grid>

                        <Grid item>
                            <Paper elevation={3} className="u-max-width-450px u-padding-16px u-center-horizontally">
                                <Field
                                    name="acceptTerms"
                                    label={Messages.acceptTermsOfUserAgreement}
                                    component={TermsOfUserAgreement}
                                />
                            </Paper>
                        </Grid>

                        <Email configuredEmailValidation={configuredEmailValidation} />
                        <Gender />
                        <Birthday />
                        <Height />
                        <Weight />
                        {renderActions()}
                        <PersonalHealthEvaluation />

                        <SubmitButton
                            label={Messages.register}
                            buttonClass={classes.button}
                            pristine={pristine}
                            submitting={submitting}
                        />
                    </Grid>
                </form>
            )} />
    );
}

export default RegisterAccountForm;
