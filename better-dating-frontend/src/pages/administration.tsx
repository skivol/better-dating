import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { getData, handleUnauthorized, headers } from "../utils";
import { fetchMapboxToken } from "../utils/BackendUtils";

const AdministrationWithoutSsr = dynamic(
  () => import("../components/Administration"),
  { ssr: false }
);

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
}: any) => {
  try {
    const usageStats = await getData(
      `${process.env.BACKEND_HOST}/api/admin/usage-stats`,
      undefined,
      headers(req)
    );
    const mapboxToken = await fetchMapboxToken(req);
    return { props: { mapboxToken, usageStats } };
  } catch (error) {
    const result = handleUnauthorized(error, res);
    if (!result) {
      throw error;
    }
    return result;
  }
};

export default AdministrationWithoutSsr;
