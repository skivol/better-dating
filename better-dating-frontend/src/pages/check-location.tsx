import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { getData, handleUnauthorized, headers } from "../utils";
import { dateIdName } from "../Messages";
import { fetchMapboxToken } from "../utils/BackendUtils";

const CheckLocationWithoutSsr = dynamic(
  () => import("../components/CheckLocation"),
  { ssr: false }
);

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
}: any) => {
  try {
    const placeData = await getData(
      `${process.env.BACKEND_HOST}/api/place`,
      { dateId: req.query[dateIdName], action: "check" },
      headers(req)
    );
    const mapboxToken = await fetchMapboxToken(req);
    return { props: { placeData, mapboxToken } };
  } catch (error) {
    const result = handleUnauthorized(error, res);
    if (!result) {
      throw error;
    }
    return result;
  }
};

export default CheckLocationWithoutSsr;
