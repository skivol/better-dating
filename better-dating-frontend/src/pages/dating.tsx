import { GetServerSideProps } from "next";
import { getData, handleUnauthorized, headers } from "../utils";
import { Dating } from "../components/Dating";

export default Dating;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
}: any) => {
  try {
    const datingData = await getData(
      `${process.env.BACKEND_HOST}/api/user/dating`,
      undefined,
      headers(req)
    );
    return { props: { datingData } };
  } catch (error) {
    const result = handleUnauthorized(error, res);
    if (!result) {
      throw error;
    }
    return result;
  }
};
