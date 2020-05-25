import { GetServerSideProps } from 'next';
import ConfirmEmail from '../containers/ConfirmEmail';
import { postData } from '../utils/FetchUtils';
import * as Messages from '../Messages';

export const getServerSideProps: GetServerSideProps = async (ctx: any) => {
    const nullifyIfEmpty = (value: any) => value ? value : null; // otherwise there could be serialization problems for "undefined" value
    const verifyEmail = async (token: string) => {
        try {
            await postData(`${process.env.BACKEND_HOST}/api/user/email/verify`, { token });
            return { verified: true };
        } catch (error) {
            return { verified: false, errorVerifying: error.message };
        }
    };

    const firstValueIfArray = (target: string[] | string) => (target instanceof Array ? target[0] : target);
    const token = firstValueIfArray(ctx.req.query[Messages.tokenName]);
    const { verified, errorVerifying } = await verifyEmail(token);
    return { props: { token, verified, errorVerifying: nullifyIfEmpty(errorVerifying) } };
};

export default ConfirmEmail;
