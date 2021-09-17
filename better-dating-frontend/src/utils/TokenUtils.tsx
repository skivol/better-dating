import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { Form } from "react-final-form";
import { Typography, Button } from "@material-ui/core";
import { CenteredSpinner, SpinnerAdornment } from "../components/common";
import { login } from "../components/navigation/NavigationUrls";
import * as actions from "../actions";
import { SnackbarVariant } from "../types";
import { expiredTokenMessage, resolveTokenMessage } from "../Messages";
import { postData, useToken, unauthorized } from ".";

export const onErrorUsingToken = (dispatch: any, errorMessage: string) =>
  dispatch(
    actions.openSnackbar(
      resolveTokenMessage(errorMessage) as string,
      SnackbarVariant.error
    )
  );

export const useRequestAnotherTokenFormIfNeeded = (
  tokenUsageUrl: string,
  onSuccess: (response: any) => any,
  onSubmit: (token: string) => any,
  sendNewTokenButtonTitle: string,
  title: string
) => {
  const dispatch = useDispatch();
  const token = useToken();
  const [hasExpiredToken, setHasExpiredToken] = useState<boolean | null>(null);
  const [success, setSuccess] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const applyToken = async (token: string) => {
      try {
        const response = await postData(tokenUsageUrl, { token });
        return { success: true, response };
      } catch (error) {
        console.error({ error });
        return { success: false, response: error, errorMessage: error.message };
      }
    };

    applyToken(token).then(({ response, success, errorMessage }) => {
      if (success) {
        setSuccess(onSuccess(response));
      } else if (errorMessage) {
        onErrorUsingToken(dispatch, errorMessage);
        setHasExpiredToken(errorMessage === expiredTokenMessage);
      } else if (unauthorized(response)) {
        router.push(login);
      }
    });
  }, []);

  if (success) {
    return success;
  }

  const requestAnotherTokenForm = () => {
    if (hasExpiredToken === null) {
      return <CenteredSpinner />;
    }

    return hasExpiredToken ? (
      <Form
        onSubmit={() => onSubmit(token)}
        render={({ handleSubmit, submitting }) => (
          <form onSubmit={handleSubmit}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
            >
              {submitting ? <SpinnerAdornment /> : sendNewTokenButtonTitle}
            </Button>
          </form>
        )}
      />
    ) : null;
  };

  const requestTokenForm = requestAnotherTokenForm();
  return (
    <div style={{ height: "120px", textAlign: "center", marginTop: "15px" }}>
      <Typography variant="h3">{title}</Typography>
      <div style={{ margin: "10px" }} />
      {requestTokenForm}
    </div>
  );
};
