import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { getData, handleUnauthorized, headers } from "../utils";
import {
  dateIdName,
  otherUserShouldBeAddingPlaceSuggestion,
} from "../Messages";
import { fetchMapboxToken } from "../utils/BackendUtils";

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
    const mapboxToken = await fetchMapboxToken(req);
    return { props: { coordinates, mapboxToken } };
  } catch (error) {
    if (
      error.message ===
      '400 BAD_REQUEST "other user should be adding place suggestion"'
    ) {
      return { props: { error: otherUserShouldBeAddingPlaceSuggestion } };
    }
    const result = handleUnauthorized(error, res);
    if (!result) {
      throw error;
    }
    return result;
  }
};

export default AddLocationWithoutSsr;
