import { useDispatch } from "react-redux";
import * as actions from "../actions";
import { useRequestAnotherTokenFormIfNeeded } from "../utils";
import { Profile } from "./Profile";
import { ProfileFormData } from "./profile";
import * as Messages from "./Messages";

type ProfileViewRelation = "AuthorsProfile" | "MatchedProfile";

type ViewProfileData = {
  profile: ProfileFormData;
  relation: ProfileViewRelation;
};

const ProfileView = () => {
  const dispatch = useDispatch();
  const onSuccess = (profileData: ViewProfileData) => {
    const message =
      profileData.relation === "MatchedProfile"
        ? Messages.matchedProfileTitle
        : Messages.authorsProfileTitle;
    return (
      <Profile
        readonly
        profileData={profileData.profile}
        titleMessage={message}
      />
    );
  };
  const onRequestAnotherToken = (token: string) =>
    dispatch(actions.requestAnotherViewProfileToken(token));

  const component = useRequestAnotherTokenFormIfNeeded(
    "/api/user/profile/view",
    onSuccess,
    onRequestAnotherToken,
    Messages.sendNewToken,
    Messages.profileView
  );

  return component;
};

export default ProfileView;
