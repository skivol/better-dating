import dynamic from "next/dynamic";

const RegisterAccountFormWithoutSsr = dynamic(
  () => import("../components/RegisterAccountForm"),
  { ssr: false }
);
export default RegisterAccountFormWithoutSsr;
