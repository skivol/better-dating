import * as React from "react";
import { parseISO } from 'date-fns';
import { FormApi } from 'final-form';
import { Form } from 'react-final-form';
import {
    Grid,
    Typography,
    Paper,
    Button,
    ButtonGroup,
    Menu, MenuItem, ListItemIcon, ListItemText,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@material-ui/core';
import { ToggleButton, Alert } from '@material-ui/lab';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faUserCheck, faUserMinus, faEllipsisV, faIdCard } from '@fortawesome/free-solid-svg-icons';

import { useMenu, useDialog } from '../utils';
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
    requestProfileRemoval: () => void;
}

export interface Props extends IDispatchProps {
    profileData: ProfileFormData;
}

const fromBackendProfileValues = ({ birthday, ...restValues }: any) => ({
    ...restValues, bday: parseISO(birthday)
});

export const Profile = ({ profileData, onSubmit, requestProfileRemoval }: Props) => {
    const classes = useStyles();
    const profileDataWithDate = fromBackendProfileValues(profileData);
    const [initialValues, setInitialValues] = React.useState(profileDataWithDate);
    const [showAnalysis, setShowAnalysis] = React.useState(false);

    React.useEffect(() => {
        if (showAnalysis) {
            setTimeout(() => document.getElementById('birthday')?.scrollIntoView({ behavior: 'smooth' }), 1000);
        }
    }, [showAnalysis]);

    const { anchorEl, menuIsOpen, openMenu, closeMenu } = useMenu();
    const { dialogIsOpen, openDialog, closeDialog } = useDialog();

    const showConfirm = () => {
        closeMenu();
        openDialog();
    };
    const onProfileRemove = () => {
        closeDialog();
        requestProfileRemoval();
    };
    const confirmDialog = (
        <Dialog
            open={dialogIsOpen}
            onClose={closeDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{Messages.areYouSureThatWantToRemoveProfile}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    <Alert severity="error">{Messages.thisActionIsIrreversible}</Alert>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeDialog} color="secondary">
                    {Messages.cancel}
                </Button>
                <Button onClick={onProfileRemove} className="u-color-red" autoFocus>
                    {Messages.yesContinue}
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <>
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
                                            <Typography variant="h3" className="u-bold u-text-align-center">
                                                <FontAwesomeIcon icon={faIdCard} /> {Messages.Profile}
                                            </Typography>
                                        </div>
                                    </Paper>
                                </Grid>
                                <Email />
                                <Gender />
                                <Birthday id="birthday" />

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
                                        startIcon={submitting ? <SpinnerAdornment /> : <FontAwesomeIcon icon={faSave} />}
                                    >
                                        {Messages.save}
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
                                    <Button
                                        className="u-color-black"
                                        onClick={openMenu}
                                    >
                                        <FontAwesomeIcon className="MuiButton-startIcon" icon={faEllipsisV} size="lg" />
                                    </Button>
                                </ButtonGroup>
                                <Menu
                                    id="menu-profile-extra"
                                    anchorEl={anchorEl}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={menuIsOpen}
                                    onClose={closeMenu}
                                >
                                    <MenuItem onClick={showConfirm}>
                                        <ListItemIcon className="u-color-red u-min-width-30px"><FontAwesomeIcon className="MuiButton-startIcon" icon={faUserMinus} /></ListItemIcon>
                                        <ListItemText className="u-color-red">{Messages.removeProfile}</ListItemText>
                                    </MenuItem>
                                </Menu>
                            </Grid>
                        </form>
                    );
                }} />
            {confirmDialog}
        </>
    );
};
