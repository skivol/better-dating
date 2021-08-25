import { GetServerSideProps } from "next";
import { getData, handleUnauthorized, headers } from "../utils";
import { History, parseHistoryData } from "../components/History";

export default History;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
}: any) => {
  try {
    const historyData = parseHistoryData(
      await getData(
        `${process.env.BACKEND_HOST}/api/history`,
        undefined,
        headers(req)
      )
    );

    const relevantUsers = await getData(
      `${process.env.BACKEND_HOST}/api/history/nicknames`,
      undefined,
      headers(req)
    );

    return { props: { initialHistoryData: historyData, relevantUsers } };
  } catch (error) {
    const result = handleUnauthorized(error, res);
    if (!result) {
      throw error;
    }
    return result;
  }
};
