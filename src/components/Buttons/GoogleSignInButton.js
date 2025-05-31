import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import { useState } from "react";

const AUTHORIZATION_STATUS = {
  AUTHORIZATION_FAILED: "AUTHORIZATION_FAILED",
  AUTHORIZATION_IN_PROGRESS: "AUTHORIZATION_IN_PROGRESS",
};

const GoogleSignInButton = () => {
  const [authorizationStatus, setAuthorizationStatus] = useState(
    AUTHORIZATION_STATUS.NOT_AUTHORIZED
  );
  const handleGoogleLogin = async () => {
    try {
      setAuthorizationStatus(AUTHORIZATION_STATUS.AUTHORIZATION_IN_PROGRESS);
      await signInWithPopup(auth, provider);
    } catch (error) {
      setAuthorizationStatus(AUTHORIZATION_STATUS.AUTHORIZATION_FAILED);
    }
  };

  return (
    <button
      disabled={
        authorizationStatus === AUTHORIZATION_STATUS.AUTHORIZATION_IN_PROGRESS
      }
      onClick={handleGoogleLogin}
      className="flex items-center justify-between gap-2 border py-1.5 px-3 rounded-3xl text-gray-700 border-gray-400 hover:text-gray-900 hover:border-gray-600 dark:text-[#aaa] dark:border-[#aaa] dark:hover:text-[#cdcdcd] dark:hover:border-[#cdcdcd] disabled:opacity-50"
    >
      <div>
        <FcGoogle />
      </div>
      <div className="text-sm">Continue with Google</div>
    </button>
  );
};

export default GoogleSignInButton;
