import * as React from "react";
import { useRouter } from 'next/router';
import { parseISO } from 'date-fns';
import { FormApi } from 'final-form';
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
import { faSave, faUserCheck, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

import * as Messages from './Messages';
import {
    ProfileFormData, Email, Gender, Birthday, Height,
    Weight, AnalyzedSection, PersonalHealthEvaluation, renderActions
} from './profile';

import { SpinnerAdornment } from './common';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {
            margin: theme.spacing(1),
        }
    })
);

export interface IDispatchProps {
    onSubmit: (data: any, form: FormApi<any>, doAfter: () => void) => void;
    onLogout: () => any;
}

export interface Props extends IDispatchProps {
    profileData: ProfileFormData;
}

const fromBackendProfileValues = ({ birthday, ...restValues }: any) => ({
    ...restValues, bday: parseISO(birthday)
});

export const Profile = ({ profileData, onSubmit, onLogout }: Props) => {
    const classes = useStyles();
    const profileDataWithDate = fromBackendProfileValues(profileData);
    const [initialValues, setInitialValues] = React.useState(profileDataWithDate);
    const [showAnalysis, setShowAnalysis] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        if (showAnalysis) {
            setTimeout(() => document.getElementById('height-weight-analyze')?.scrollIntoView({ behavior: 'smooth' }), 1000);
        }
    }, [showAnalysis]);

    return (
        <Form
            initialValues={initialValues}
            onSubmit={(values, form) => {
                onSubmit(values, form, () => setInitialValues(values));
            }}
            render={({ handleSubmit, values, pristine, submitting }) => {
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
                            <Email />
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
                                <Button onClick={() => onLogout().then(() => router.push("/"))}>
                                    <FontAwesomeIcon className="MuiButton-startIcon" icon={faSignOutAlt} />
                                    {Messages.logout}
                                </Button>
                            </ButtonGroup>
                        </Grid>
                    </form>
                );
            }} />
    );
};
