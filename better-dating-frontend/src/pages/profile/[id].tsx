import { GetServerSideProps } from 'next';
import { getData } from '../../utils/FetchUtils';
import Profile from '../../containers/Profile';

export default Profile;

export const getServerSideProps: GetServerSideProps = async (ctx: any) => {
    const profileData = await getData(`${process.env.BACKEND_HOST}/api/user/profile/${ctx.params.id}`);
    return { props: { profileData } };
};

