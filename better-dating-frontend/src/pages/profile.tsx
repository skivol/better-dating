import { GetServerSideProps } from "next";
import { getData, handleUnauthorized, headers } from "../utils";
import { Profile } from "../components/Profile";

export default Profile;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
}: any) => {
  try {
    const profileData = await getData(
      `${process.env.BACKEND_HOST}/api/user/profile`,
      undefined,
      headers(req)
    );
    return { props: { profileData } };
  } catch (error) {
    const result = handleUnauthorized(error, res);
    if (!result) {
      throw error;
    }
    return result;
  }
};
