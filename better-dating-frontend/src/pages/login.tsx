import dynamic from "next/dynamic";

const LoginWithoutSsr = dynamic(() => import("../containers/Login"), {
  ssr: false,
});

export default LoginWithoutSsr;
