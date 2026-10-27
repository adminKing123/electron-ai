import { FaApple } from "react-icons/fa";
import SocialSignInButton from "./SocialSignInButton";
import { AUTHORIZATION_STATUS } from "../../constants/authorizationStatus";

const AppleSignInButton = () => {
  return (
    <SocialSignInButton
      onClick={() => {}}
      authorizationStatus={AUTHORIZATION_STATUS.NOT_AUTHORIZED}
      icon={<FaApple className="text-ink-975 dark:text-ink-75" />}
      label="Continue with Apple"
    />
  );
};

export default AppleSignInButton;
