import { AUTHORIZATION_STATUS } from "../../constants/authorizationStatus";

const SocialSignInButton = ({
  onClick,
  authorizationStatus,
  disabled,
  icon,
  label,
  loadingLabel = "Signing in...",
  errorMessage = "Sign-in failed. Please try again.",
}) => {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <button
        type="button"
        disabled={
          disabled ??
          authorizationStatus === AUTHORIZATION_STATUS.AUTHORIZATION_IN_PROGRESS
        }
        onClick={onClick}
        className="w-full flex items-center justify-center gap-2.5
          py-2.5 px-5 rounded-2xl
          bg-white dark:bg-void-825
          border border-ink-150 dark:border-void-800
          hover:bg-ink-50 dark:hover:bg-void-800
          hover:border-brand-300 dark:hover:border-brand-500/50
          text-ink-975 dark:text-ink-75
          text-[13px] font-medium
          shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-none
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors"
      >
        {authorizationStatus === AUTHORIZATION_STATUS.AUTHORIZATION_IN_PROGRESS ? (
          <span className="w-[15px] h-[15px] rounded-full border-2 border-ink-300 border-t-ink-650 dark:border-void-700 dark:border-t-ink-400 animate-spin flex-shrink-0" />
        ) : (
          <span className="w-[15px] h-[15px] flex items-center justify-center flex-shrink-0 [&>svg]:w-[15px] [&>svg]:h-[15px]">
            {icon}
          </span>
        )}
        <span>
          {authorizationStatus === AUTHORIZATION_STATUS.AUTHORIZATION_IN_PROGRESS
            ? loadingLabel
            : label}
        </span>
      </button>

      {authorizationStatus === AUTHORIZATION_STATUS.AUTHORIZATION_FAILED && (
        <p className="text-[12px] text-red-500 text-center">{errorMessage}</p>
      )}
    </div>
  );
};

export default SocialSignInButton;
