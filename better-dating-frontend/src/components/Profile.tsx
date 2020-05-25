import * as React from "react";
import { FormApi, FieldState, FieldValidator } from 'final-form';
import { Form } from 'react-final-form';
import {
    Grid,
    Typography,
    Paper
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { validateEmail } from '../utils/ValidationUtils';
import { emailHasChanged } from '../utils/FormUtils';
import * as Messages from './Messages';
import ProfileFormData from './profile/ProfileFormData';
import Email from './profile/Email';
import Gender from './profile/Gender';
import Birthday from './profile/Birthday';
import Height from './profile/Height';
import Weight from './profile/Weight';

import PersonalHealthEvaluation from './profile/PersonalHealthEvaluation';

import { renderActions } from './profile/Actions';
import CenteredSubmitButton from './profile/CenteredSubmitButton';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {
            margin: theme.spacing(1),
        }
    })
);

export interface IDispatchProps {
    onSubmit: (data: ProfileFormData, form: FormApi<ProfileFormData>, doAfter: () => void) => void;
    onCouldNotCheckIfAlreadyPresentEmail: () => void;
}

export interface Props extends IDispatchProps {
    profileData: ProfileFormData;
}

export const Profile = ({ profileData, onSubmit, onCouldNotCheckIfAlreadyPresentEmail }: Props) => {
    const classes = useStyles();
    const emailValidation = validateEmail(onCouldNotCheckIfAlreadyPresentEmail);
    const [initialValues, setInitialValues] = React.useState(profileData);

    return (
        <Form
            initialValues={initialValues}
            onSubmit={(values, form) => {
                onSubmit(values, form, () => setInitialValues(values));
            }}
            render={({ handleSubmit, form, pristine, submitting }) => {
                const emailValidator: FieldValidator<string> = (value: string, allValues: object, meta?: FieldState<string>) => {
                    if (!emailHasChanged(form)) { // no need to check availability in this case
                        return undefined;
                    }
                    return emailValidation(value);
                };
                return (
                    <form onSubmit={handleSubmit}>
                        <Grid
                            container
                            direction="column"
                            className="u-margin-top-bottom-15px u-min-width-300px u-padding-10px"
                            spacing={2}
                        >
                            <Grid item>
                                <Paper elevation={3} className="u-padding-16px u-center-horizontally u-max-width-400px">
                                    <div className="u-center-horizontally u-fit-content u-margin-bottom-10px">
                                        <Typography variant="h3" className="u-bold">
                                            {Messages.Profile}
                                        </Typography>
                                    </div>
                                </Paper>
                            </Grid>
                            <Email configuredEmailValidation={emailValidator} />
                            <Gender />
                            <Birthday />
                            <Height />
                            <Weight />
                            {renderActions()}
                            <PersonalHealthEvaluation />

                            <CenteredSubmitButton
                                label={Messages.save}
                                buttonClass={classes.button}
                                pristine={pristine}
                                submitting={submitting} />
                        </Grid>
                    </form>
                );
            }} />
    );
};
