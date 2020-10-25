import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { SnackbarVariant } from "../types";
import * as actions from "../actions";
import { getData, useToken } from "../utils";
import { resolveTokenMessage } from "../Messages";
import { CenteredSpinner } from "./common";
import { Profile } from "./Profile";
import { ProfileFormData } from "./profile";

const ProfileView = () => {
  const token = useToken();
  const dispatch = useDispatch();
  const [profileData, setProfileData] = useState<null | ProfileFormData>(null);

  useEffect(() => {
    getData("/api/user/profile/view", { token })
      .then(setProfileData)
      .catch((errorMessage) =>
        dispatch(
          actions.openSnackbar(
            resolveTokenMessage(errorMessage),
            SnackbarVariant.error
          )
        )
      );
  }, []);

  if (!profileData) {
    return <CenteredSpinner />;
  }

  return <Profile readonly profileData={profileData} />;
};

export default ProfileView;
