import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { getData, handleUnauthorized, headers } from "../utils";
import { dateIdName } from "../Messages";

const ViewLocationWithoutSsr = dynamic(
  () => import("../components/location/ViewLocation"),
  { ssr: false }
);

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
}: any) => {
  try {
    const placeData = await getData(
      `${process.env.BACKEND_HOST}/api/place`,
      { dateId: req.query[dateIdName], action: "view" },
      headers(req)
    );
    return { props: { placeData } };
  } catch (error) {
    const result = handleUnauthorized(error, res);
    if (!result) {
      throw error;
    }
    return result;
  }
};

export default ViewLocationWithoutSsr;
