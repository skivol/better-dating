import * as React from "react";
import Link from 'next/link';
import {
    Grid,
    Paper,
    Typography,
    Button,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Form } from 'react-final-form';
import { Email } from './profile';
import { SpinnerAdornment } from './common';
import * as Messages from './Messages';
import { toPage, registerAccount } from './navigation/NavigationUrls';

import { connect } from 'react-redux';
import { BetterDatingThunkDispatch } from '../configureStore';
import * as actions from '../actions';

type IDispatchProps = {
    onLoginLink: (email: string) => any;
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {
            margin: theme.spacing(1),
        },
    })
);

const LoginBoxComponent = ({ onLoginLink }: IDispatchProps) => {
    const classes = useStyles();
    return (
        <Grid item>
            <Form
                onSubmit={(values) => onLoginLink(values.email)}
                render={({ handleSubmit, submitting, values }) => {
                    return (
                        <form onSubmit={handleSubmit}>
                            <Paper elevation={3} className="u-padding-16px u-center-horizontally u-max-width-450px">
                                <Email label={Messages.mail} />
                                <Grid container justify="center" alignItems="center">
                                    <Button
                                        className={classes.button}
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        disabled={submitting}
                                        startIcon={submitting ? (<SpinnerAdornment />) : (<FontAwesomeIcon icon={faSignInAlt} />)}
                                    >
                                        <Typography>
                                            {Messages.enterUsingEmail}
                                        </Typography>
                                    </Button>
                                    <Button
                                        className={classes.button}
                                        href="/api/auth/login/oauth2/authorization/facebook"
                                        variant="outlined"
                                        color="primary"
                                    >
                                        <Typography>
                                            {Messages.enterUsingFacebook}
                                        </Typography>
                                    </Button>
                                    <Button
                                        className={classes.button}
                                        href="/api/auth/login/oauth2/authorization/vk"
                                        variant="outlined"
                                        color="default"
                                    >
                                        <Typography>
                                            {Messages.enterUsingVk}
                                        </Typography>
                                    </Button>
                                    <Link href={{ pathname: toPage(registerAccount), query: { email: values.email } }} as={registerAccount}>
                                        <Button
                                            className={classes.button}
                                            variant="text"
                                            color="secondary"
                                            startIcon={<FontAwesomeIcon icon={faUserPlus} />}
                                        >
                                            <Typography>
                                                {Messages.register}
                                            </Typography>
                                        </Button>
                                    </Link>
                                </Grid>
                            </Paper>
                        </form>
                    );
                }}
            />
        </Grid>
    )
}

const mapDispatchToProps = (dispatch: BetterDatingThunkDispatch): IDispatchProps => ({
    onLoginLink: (email: string) => dispatch(actions.requestLogin(email)),
});

export const LoginBox = connect(null, mapDispatchToProps)(LoginBoxComponent);
