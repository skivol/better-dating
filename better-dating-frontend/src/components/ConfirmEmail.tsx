import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { SnackbarVariant } from "../types";
import * as actions from "../actions";
import { successVerifyingEmailMessage } from "../Messages";
import { useRequestAnotherTokenFormIfNeeded } from "../utils";
import { profile } from "../components/navigation/NavigationUrls";
import * as Messages from "./Messages";

const ConfirmEmail = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const onTokenVerified = () =>
    dispatch(
      actions.openSnackbar(
        successVerifyingEmailMessage,
        SnackbarVariant.success
      )
    );
  const onSuccess = () => {
    onTokenVerified();
    dispatch(actions.fetchUser());
    setTimeout(() => router.push(profile), 5000);
  };
  const onRequestAnotherValidationToken = (previousToken: string) =>
    dispatch(actions.requestAnotherValidationToken(previousToken));

  const component = useRequestAnotherTokenFormIfNeeded(
    "/api/user/email/verify",
    onSuccess,
    onRequestAnotherValidationToken,
    Messages.sendNewToken,
    Messages.emailVerification
  );

  return component;
};

export default ConfirmEmail;
