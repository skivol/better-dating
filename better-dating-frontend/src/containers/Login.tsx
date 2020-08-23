import * as React from 'react';
import { connect } from 'react-redux';
import { useRouter } from 'next/router';
import { useToken } from '../utils';
import * as actions from '../actions';
import { CenteredSpinner } from '../components/common';
import { profile } from '../components/navigation/NavigationUrls';
import { BetterDatingThunkDispatch } from '../configureStore';
import * as Messages from '../Messages';
import { SnackbarVariant } from '../types';
import { LoginBox } from '../components/LoginBox';

type Props = {
    performLogin: (token: string) => any;
    onErrorLogin: (e: any) => any;
};
const Login = ({ performLogin, onErrorLogin }: Props) => {
    const router = useRouter();
    const token = useToken();

    React.useEffect(() => {
        if (token) {
            return performLogin(token).then(
                () => router.push(profile)
            ).catch((e: any) => {
                onErrorLogin(e);
                router.push("/");
            });
        }
    }, [performLogin]);

    return token ? <CenteredSpinner /> : <LoginBox />;
};

export const mapDispatchToProps = (dispatch: BetterDatingThunkDispatch) => ({
    performLogin: (token: string) => dispatch(actions.performLogin(token)),
    onErrorLogin: (error: any) => dispatch(actions.openSnackbar(Messages.errorLogin, SnackbarVariant.error)),
});

export default connect(null, mapDispatchToProps)(Login);
