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

  const isLoading = authorizationStatus === AUTHORIZATION_STATUS.AUTHORIZATION_IN_PROGRESS;
  const hasFailed = authorizationStatus === AUTHORIZATION_STATUS.AUTHORIZATION_FAILED;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <button
        disabled={isLoading}
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2.5
          py-2.5 px-5 rounded-2xl
          bg-white dark:bg-[#1e1e1e]
          border border-[#e5e5e5] dark:border-[#2a2a2a]
          hover:bg-[#f5f5f5] dark:hover:bg-[#252525]
          text-[#111] dark:text-[#eee]
          text-[13px] font-medium
          shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-none
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors"
      >
        {isLoading ? (
          <span className="w-[15px] h-[15px] rounded-full border-2 border-[#ccc] border-t-[#555] dark:border-[#444] dark:border-t-[#aaa] animate-spin flex-shrink-0" />
        ) : (
          <FcGoogle className="w-[15px] h-[15px] flex-shrink-0" />
        )}
        <span>{isLoading ? "Signing in…" : "Continue with Google"}</span>
      </button>

      {hasFailed && (
        <p className="text-[12px] text-red-500 text-center">
          Sign-in failed. Please try again.
        </p>
      )}
    </div>
  );
};

export default GoogleSignInButton;
