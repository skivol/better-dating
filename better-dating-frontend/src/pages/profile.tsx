import { GetServerSideProps } from 'next';
import { getData } from '../utils/FetchUtils';
import Profile from '../containers/Profile';

export default Profile;

export const getServerSideProps: GetServerSideProps = async ({ req, res }: any) => {
    const headers = req.rawHeaders.reduce((acc: { [key: string]: string }, curr: string, index: number, arr: string[]) => {
        if (index % 2 == 0) {
            acc[arr[index]] = arr[index + 1];
        }
        return acc;
    }, {});

    try {
        const profileData = await getData(`${process.env.BACKEND_HOST}/api/user/profile`, undefined, headers);
        return { props: { profileData } };
    } catch (error) {
        if (error.status === 401) {
            if (res) {
                res.writeHead(301, { Location: '/' });
                res.end();
            }

            return { props: {} };
        }
        throw error;
    }
};
