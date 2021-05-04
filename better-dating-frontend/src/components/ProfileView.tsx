import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { SnackbarVariant } from "../types";
import * as actions from "../actions";
import { getData, useToken } from "../utils";
import { resolveTokenMessage } from "../Messages";
import { CenteredSpinner } from "./common";
import { Profile } from "./Profile";
import { ProfileFormData } from "./profile";
import * as Messages from "./Messages";

type ProfileViewRelation = "authorsProfile" | "matchedProfile";

type ViewProfileData = {
  profile: ProfileFormData;
  relation: ProfileViewRelation;
};

const ProfileView = () => {
  const token = useToken();
  const dispatch = useDispatch();
  const [profileData, setProfileData] = useState<null | ViewProfileData>(null);

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

  const message = profileData.relation === "matchedProfile"
    ? Messages.matchedProfileTitle
    : Messages.authorsProfileTitle;
  return <Profile readonly profileData={profileData.profile} titleMessage={message} />;
};

export default ProfileView;
