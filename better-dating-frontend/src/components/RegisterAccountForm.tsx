import * as React from "react";
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router'

import { Form, FormSpy } from 'react-final-form';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    Grid,
    Typography,
    Paper,
    Fab
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Field } from 'react-final-form';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import { storageCreator, ensureBdayIsDate } from '../utils';
import * as actions from '../actions';
import * as Messages from './Messages';
import { TermsOfUserAgreement, RegistrationFormData, defaultValues as registrationDataDefaults } from './register-account';
import { Email, Nickname, Gender, Birthday, Height, Weight, PersonalHealthEvaluation, renderActions, SubmitButton } from './profile';


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {
            margin: theme.spacing(1),
        },
        icon: {
            marginRight: theme.spacing(1),
        },
    })
);

const storage = storageCreator("registration-data");

const currentTime = () => new Date().getTime();
export const RegisterAccountForm = () => {
    const classes = useStyles();
    const router = useRouter();
    const email = Array.isArray(router.query.email) ? router.query.email[0] : router.query.email;
    const initialValues = {
        ...registrationDataDefaults,
        email,
        ...ensureBdayIsDate(storage.load())
    };
    const dispatch = useDispatch();
    const [submitting, setSubmitting] = React.useState(false);
    const [formKey, setFormKey] = React.useState(currentTime());
    const reset = () => {
        storage.clear();
        setFormKey(currentTime()); // re-create form completely to avoid validation errors after reset
    };
    const onSubmit = (values: RegistrationFormData) => {
        setSubmitting(true);
        dispatch(actions.createAccount(values))
            .then(() => reset())
            .finally(() => setSubmitting(false));
    };

    return ( // validateOnBlur doesn't seem to properly work (for example, email field)...
        <Form
            key={formKey}
            initialValues={initialValues}
            onSubmit={onSubmit}
            render={({ handleSubmit }) => {
                const storedData = storage.load();
                const hasData = storedData.acceptTerms || storedData.personalHealthEvaluation !== -1 || Object.keys(storedData).length > 2;

                return (
                    <form onSubmit={handleSubmit}>
                        <FormSpy
                            subscription={{ values: true }}
                            onChange={props => {
                                // save the progress
                                storage.save(props.values);
                            }}
                        />
                        <Grid
                            container
                            direction="column"
                            className="u-margin-top-bottom-15px u-min-width-450px u-padding-10px"
                            spacing={2}
                        >
                            <Grid item>
                                <Paper elevation={3} className="u-padding-16px u-center-horizontally u-max-width-450px">
                                    <div className="u-center-horizontally u-margin-bottom-10px">
                                        <Typography variant="h3" className="u-bold u-text-align-center">
                                            <FontAwesomeIcon icon={faUserPlus} className="u-right-margin-10px" />
                                            {Messages.Registration}
                                        </Typography>
                                    </div>
                                    <Alert
                                        className="u-max-width-500px u-center-horizontally u-margin-bottom-10px"
                                        severity="info"
                                    >
                                        <Typography>{Messages.willBeHardButFun}</Typography>
                                    </Alert>
                                    <Alert severity="success">
                                        <Typography>{Messages.progressIsSaved}</Typography>
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
                            <Nickname />
                            <Gender />
                            <Birthday />
                            <Height />
                            <Weight />
                            {renderActions(null, false, false)}
                            <PersonalHealthEvaluation />

                            <SubmitButton
                                label={Messages.register}
                                buttonClass={classes.button}
                                submitting={submitting}
                            />
                            {hasData && (<div className="c-clear-button">
                                <Fab variant="extended" onClick={() => reset()}>
                                    <FontAwesomeIcon className={classes.icon} icon={faTrashAlt} />
                                    {Messages.clear}
                                </Fab>
                            </div>)}
                        </Grid>
                    </form>
                );
            }} />
    );
}

export default RegisterAccountForm;
