import React from "react";
import { TbBell, TbBellOff } from "react-icons/tb";
import usePushNotification from "../../hooks/usePushNotification";

const NotificationHeader = ({ permission, subscribed }) => {
  const icon =
    permission === "denied" ? (
      <TbBellOff className="w-[15px] h-[15px] text-[#e05c5c] flex-shrink-0" />
    ) : subscribed ? (
      <TbBell className="w-[15px] h-[15px] text-[#10b981] flex-shrink-0" />
    ) : (
      <TbBell className="w-[15px] h-[15px] text-ink-500 flex-shrink-0" />
    );

  const title =
    permission === "denied"
      ? "Notifications blocked"
      : subscribed
        ? "Notifications enabled"
        : "Notification permission required";

  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-[13px] font-semibold text-ink-750 dark:text-ink-300">
        {title}
      </span>
    </div>
  );
};

const NotificationDescription = ({ permission, subscribed }) => {
  const description = subscribed
    ? "This device will receive push notifications."
    : permission === "denied"
      ? "You've blocked notifications for this site. Enable them in your browser settings, then click below to re-sync."
      : "Allow browser notifications so Comet AI can deliver push alerts when this step runs.";

  return (
    <p className="text-[12px] text-ink-500 dark:text-ink-550 leading-relaxed">
      {description}
    </p>
  );
};

const SubscribedButton = ({ onDisable }) => (
  <button
    type="button"
    onClick={onDisable}
    className="
      self-start flex items-center gap-1.5
      px-3 py-1.5 rounded-lg
      text-[12px] font-medium
      border border-ink-200 dark:border-void-775
      text-[#e05c5c] dark:text-[#c26060]
      hover:bg-[#fef2f2] dark:hover:bg-[#2a1a1a]
      hover:border-[#fca5a5] dark:hover:border-[#7f1d1d]
      transition-colors
    "
  >
    <TbBellOff className="w-[13px] h-[13px]" />
    Turn off notifications
  </button>
);

const EnableNotificationButton = ({ requesting, onEnable }) => (
  <button
    type="button"
    onClick={onEnable}
    disabled={requesting}
    className="
      self-start flex items-center gap-1.5
      px-3 py-1.5 rounded-lg
      text-[12px] font-medium
      border border-ink-200 dark:border-void-775
      text-ink-700 dark:text-ink-450
      hover:bg-ink-50 dark:hover:bg-void-825
      hover:border-ink-300 dark:hover:border-void-725
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-colors
    "
  >
    {requesting ? (
      <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
    ) : (
      <TbBell className="w-[13px] h-[13px]" />
    )}

    {requesting ? "Requesting…" : "Allow notifications"}
  </button>
);

const NotificationSettings = ({
  nodeType,
  visibleNodeType = "get_notified",
}) => {
  const push = usePushNotification();

  if (nodeType !== visibleNodeType || !push?.supported) {
    return null;
  }

  const handleEnable = async () => {
    try {
      if (push.permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        await push.subscribe(registration);
        return;
      }

      await push.requestPermission();
    } catch (error) {
      console.error("Failed to enable notifications:", error);
    }
  };

  return (
    <div
      className="
        flex flex-col gap-2.5
        p-3 rounded-lg
        border border-ink-200 dark:border-void-775
        bg-white dark:bg-void-850
      "
    >
      <NotificationHeader
        permission={push.permission}
        subscribed={push.subscribed}
      />

      <NotificationDescription
        permission={push.permission}
        subscribed={push.subscribed}
      />

      {push.subscribed ? (
        <SubscribedButton onDisable={push.unsubscribe} />
      ) : (
        <EnableNotificationButton
          requesting={push.requesting}
          onEnable={handleEnable}
        />
      )}
    </div>
  );
};

export default NotificationSettings;
