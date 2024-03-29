import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useToken } from "../utils";
import * as actions from "../actions";
import { CenteredSpinner } from "../components/common";
import { profile } from "../components/navigation/NavigationUrls";
import { LoginBox } from "../components/LoginBox";

const Login = () => {
  const router = useRouter();
  const token = useToken();
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      dispatch(actions.performLogin(token))
        .then(() => dispatch(actions.fetchUser()))
        .then(() => router.push(profile))
        .catch(() => router.push("/"));
    }
  }, [dispatch]);

  return token ? <CenteredSpinner /> : <LoginBox />;
};

export default Login;
