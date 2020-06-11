import * as React from "react";
import { parseISO } from 'date-fns';
import { FormApi, FieldState, FieldValidator } from 'final-form';
import { Form } from 'react-final-form';
import {
    Grid,
    Typography,
    Paper,
    Button,
    ButtonGroup
} from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faUserCheck } from '@fortawesome/free-solid-svg-icons';

import { validateEmail } from '../utils/ValidationUtils';
import { emailHasChanged } from '../utils/FormUtils';
import * as Messages from './Messages';
import ProfileFormData from './profile/ProfileFormData';
import Email from './profile/Email';
import Gender from './profile/Gender';
import Birthday from './profile/Birthday';
import Height from './profile/Height';
import Weight from './profile/Weight';
import AnalyzedSection from './profile/AnalyzedSection';

import PersonalHealthEvaluation from './profile/PersonalHealthEvaluation';

import { renderActions } from './profile/Actions';
import SpinnerAdornment from './SpinnerAdornment';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {
            margin: theme.spacing(1),
        }
    })
);

export interface IDispatchProps {
    onSubmit: (data: any, form: FormApi<any>, doAfter: () => void) => void;
    onCouldNotCheckIfAlreadyPresentEmail: () => void;
}

export interface Props extends IDispatchProps {
    profileData: ProfileFormData;
}

const fromBackendProfileValues = ({ birthday, ...restValues }: any) => ({
    ...restValues, bday: parseISO(birthday)
});

export const Profile = ({ profileData, onSubmit, onCouldNotCheckIfAlreadyPresentEmail }: Props) => {
    const classes = useStyles();
    const emailValidation = validateEmail(onCouldNotCheckIfAlreadyPresentEmail);
    const profileDataWithDate = fromBackendProfileValues(profileData);
    const [initialValues, setInitialValues] = React.useState(profileDataWithDate);
    const [showAnalysis, setShowAnalysis] = React.useState(false);

    React.useEffect(() => {
        if (showAnalysis) {
            document.getElementById('height-weight-analyze')?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [showAnalysis]);

    return (
        <Form
            initialValues={initialValues}
            onSubmit={(values, form) => {
                onSubmit(values, form, () => setInitialValues(values));
            }}
            render={({ handleSubmit, form, values, pristine, submitting }) => {
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
                            className="u-margin-top-bottom-15px u-padding-10px"
                            spacing={2}
                        >
                            <Grid item>
                                <Paper elevation={3} className="u-padding-16px u-center-horizontally u-max-width-450px u-min-width-450px">
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

                            <AnalyzedSection id="height-weight-analyze" type="height-weight" values={values} visible={showAnalysis}>
                                <Height />
                                <Weight />
                            </AnalyzedSection>

                            {renderActions(values, showAnalysis)}
                            <AnalyzedSection type="summary" values={values} visible={showAnalysis}>
                                <PersonalHealthEvaluation />
                            </AnalyzedSection>

                            <ButtonGroup
                                variant="contained"
                                size="large"
                                className={`${classes.button} u-center-horizontally`}
                            >
                                <Button
                                    color="primary"
                                    type="submit"
                                    disabled={pristine || submitting}
                                    startIcon={<FontAwesomeIcon icon={faSave} />}
                                >
                                    {submitting ? <SpinnerAdornment /> : Messages.save}
                                </Button>
                                <ToggleButton
                                    className="u-color-green"
                                    selected={showAnalysis}
                                    value="analyze"
                                    onChange={() => setShowAnalysis(!showAnalysis)}
                                >
                                    <FontAwesomeIcon className="MuiButton-startIcon" icon={faUserCheck} />
                                    {showAnalysis ? Messages.hideAnalysis : Messages.analyze}
                                </ToggleButton>
                            </ButtonGroup>
                        </Grid>
                    </form>
                );
            }} />
    );
};
