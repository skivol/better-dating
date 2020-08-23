import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from 'next/router';
import { Form } from "react-final-form";
import { Grid, Typography, Button } from "@material-ui/core";
import { Select, TextField } from 'mui-rff';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserMinus } from '@fortawesome/free-solid-svg-icons';
import { useToken, useUser, required, validateExplanationComment } from "../utils";
import { SnackbarVariant } from '../types';
import { removeAccount, openSnackbar } from '../actions';
import * as Messages from './Messages';
import { CenteredSpinner, SpinnerAdornment } from "./common";

const removalReasonOptions = [{
    label: Messages.expectedSomethingElse,
    value: "expectedSomethingElse"
}, {
    label: Messages.tooComplicated,
    value: "tooComplicated"
}, {
    label: Messages.other,
    value: "other"
}];
export const RemoveProfile = () => {
    const user = useUser();
    const token = useToken();
    const router = useRouter();
    const dispatch = useDispatch();
    const [performingAccountRemoval, setRemovingAccount] = useState(false);
    const onProfileRemove = ({ reason, explanationComment }: any) => {
        setRemovingAccount(true); // to avoid "should be logged in" message while performing removal
        dispatch(removeAccount(token, reason, explanationComment)).then(() => router.push("/"));
    };

    if (user.loading) {
        return (
            <CenteredSpinner />
        );
    } else if (!user.loading && !user.id && !performingAccountRemoval) {
        // unauthorized user cannot remove profile
        dispatch(openSnackbar(Messages.shouldBeLoggedIn, SnackbarVariant.error))
        router.push("/");
        return null;
    }

    return (
        <>
            <Typography variant="h3" className="u-text-align-center">{Messages.profileRemoval}</Typography>
            <Form
                initialValues={{
                    reason: null,
                    explanationComment: null
                }}
                onSubmit={onProfileRemove}
                render={({ handleSubmit, submitting }) => {
                    return (
                        <form onSubmit={handleSubmit}>
                            <Grid container direction="column" spacing={3} className="u-padding-16px u-center-horizontally u-max-width-450px">
                                <Grid item>
                                    <Select
                                        required
                                        label={Messages.reasonToRemove}
                                        name="reason"
                                        data={removalReasonOptions}
                                        fieldProps={{ validate: required }}
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        required
                                        label={Messages.comment}
                                        name="explanationComment"
                                        multiline
                                        helperText={Messages.moreDetailedReasoning}
                                        fieldProps={{ validate: validateExplanationComment }}
                                    />
                                </Grid>
                                <Grid item className="u-display-flex u-align-self-end">
                                    <Button
                                        type="submit"
                                        variant="outlined"
                                        className="u-color-red"
                                        disabled={submitting}
                                        startIcon={submitting ? <SpinnerAdornment /> : <FontAwesomeIcon icon={faUserMinus} />}
                                    >
                                        {Messages.removeProfile}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    );
                }}
            />
        </>
    )
};

export default RemoveProfile;
