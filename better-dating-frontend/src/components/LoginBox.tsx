import * as React from "react";
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import {
    Grid,
    Paper,
    Typography,
    Button,
    Divider
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faVk } from '@fortawesome/free-brands-svg-icons';
import { Form } from 'react-final-form';
import { Email } from './profile';
import { SpinnerAdornment } from './common';
import * as Messages from './Messages';
import { toPage, registerAccount } from './navigation/NavigationUrls';

import * as actions from '../actions';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {
            margin: theme.spacing(1),
            width: 258,
        },
    })
);

export const LoginBox = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const onLoginLink = (email: string) => dispatch(actions.requestLogin(email));
    return (
        <Grid container>
            <Grid item style={{ flexGrow: 1 }}>
                <Form
                    onSubmit={(values) => onLoginLink(values.email)}
                    render={({ handleSubmit, submitting, values }) => {
                        return (
                            <form onSubmit={handleSubmit}>
                                <Paper elevation={3} className="u-padding-16px u-center-horizontally u-max-width-450px">
                                    <Email label={Messages.mail} elevation={0} />
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
                                    <Divider className="u-margin-top-bottom-10px" />
                                    <Grid container justify="center" alignItems="center">
                                        <Button
                                            className={classes.button}
                                            href="/api/auth/login/oauth2/authorization/facebook"
                                            variant="outlined"
                                            color="primary"
                                            startIcon={<FontAwesomeIcon icon={faFacebook} />}
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
                                            startIcon={<FontAwesomeIcon icon={faVk} />}
                                        >
                                            <Typography>
                                                {Messages.enterUsingVk}
                                            </Typography>
                                        </Button>
                                    </Grid>
                                </Paper>
                            </form>
                        );
                    }}
                />
            </Grid>
        </Grid>
    )
};
