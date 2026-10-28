import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import { useState } from "react";
import SocialSignInButton from "./SocialSignInButton";
import { AUTHORIZATION_STATUS } from "../../constants/authorizationStatus";

const GoogleSignInButton = () => {
  const [authorizationStatus, setAuthorizationStatus] = useState(
    AUTHORIZATION_STATUS.NOT_AUTHORIZED
  );

  const handleGoogleLogin = async () => {
    try {
      setAuthorizationStatus(AUTHORIZATION_STATUS.AUTHORIZATION_IN_PROGRESS);
      await signInWithPopup(auth, provider);
    } catch {
      setAuthorizationStatus(AUTHORIZATION_STATUS.AUTHORIZATION_FAILED);
    }
  };

  return (
    <SocialSignInButton
      onClick={handleGoogleLogin}
      authorizationStatus={authorizationStatus}
      icon={<FcGoogle />}
      label="Continue with Google"
    />
  );
};

export default GoogleSignInButton;
