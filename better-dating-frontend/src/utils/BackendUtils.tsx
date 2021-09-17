import { getData, headers } from ".";

export const fetchMapboxToken = async (req: any) => {
  const response = await getData(
    `${process.env.BACKEND_HOST}/api/place/token`,
    undefined,
    headers(req)
  );
  return response.token;
};
