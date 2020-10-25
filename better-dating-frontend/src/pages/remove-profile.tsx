import dynamic from "next/dynamic";

const RemoveProfileWithoutSsr = dynamic(
  () => import("../components/RemoveProfile"),
  { ssr: false }
);

export default RemoveProfileWithoutSsr;
