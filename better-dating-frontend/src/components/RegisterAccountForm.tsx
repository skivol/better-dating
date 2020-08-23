import * as React from "react";
import { useRouter } from 'next/router'

import { Form } from 'react-final-form';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Grid,
    Typography,
    Paper,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Field } from 'react-final-form';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';

import * as Messages from './Messages';
import { TermsOfUserAgreement, RegistrationFormData, defaultValues as registrationDataDefaults } from './register-account';
import { Email, Gender, Birthday, Height, Weight, PersonalHealthEvaluation, renderActions, SubmitButton } from './profile';


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {
            margin: theme.spacing(1),
        }
    })
);

export interface IDispatchProps {
    onSubmit: (data: RegistrationFormData) => void;
}

export const RegisterAccountForm = ({ onSubmit }: IDispatchProps) => {
    const classes = useStyles();
    const router = useRouter();
    const email = Array.isArray(router.query.email) ? router.query.email[0] : router.query.email;
    const initialValues = {
        ...registrationDataDefaults,
        email
    };

    return (
        <Form
            initialValues={initialValues}
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
                                    <Typography variant="h3" className="u-bold u-text-align-center">
                                        <FontAwesomeIcon icon={faUserPlus} className="u-right-margin-10px" />
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

                        <Email />
                        <Gender />
                        <Birthday />
                        <Height />
                        <Weight />
                        {renderActions(null, false)}
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
