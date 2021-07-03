import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { getData, handleUnauthorized, headers } from "../utils";
import { dateIdName } from "../Messages";

const AddLocationWithoutSsr = dynamic(
  () => import("../components/AddLocation"),
  { ssr: false }
);

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
}: any) => {
  try {
    const coordinates = await getData(
      `${process.env.BACKEND_HOST}/api/place/resolve-coordinates`,
      { dateId: req.query[dateIdName] },
      headers(req)
    );
    return { props: { coordinates } };
  } catch (error) {
    const result = handleUnauthorized(error, res);
    if (!result) {
      throw error;
    }
    return result;
  }
};

export default AddLocationWithoutSsr;
