import { format, isToday, isYesterday, differenceInDays } from "date-fns";

export const scrollToMessage = (id, duration = 100, behavior = "smooth") => {
  setTimeout(() => {
    const messageEle = document.getElementById(id);
    const container = document.getElementById("messages-container");
    if (messageEle && container) {
      const topPos = messageEle.offsetTop + messageEle.offsetHeight;
      container.scrollTo({
        top: topPos,
        behavior: behavior,
      });
    }
  }, duration);
};

export const scrollToBottom = (chat, duration = 50) => {
  const genContainer = document.getElementById("gen-container");
  const container = document.getElementById("messages-container");
  if (chat?.scroll_to_message) {
    setTimeout(() => {
      container.scrollTop = container.scrollHeight + 200;
      genContainer.classList.remove("opacity-0");
    }, duration);
  } else {
    genContainer.classList.remove("opacity-0");
  }
};

export const groupByDate = (data, key = "updated_at") => {
  const grouped = {};

  data.forEach((item) => {
    const date = new Date(item[key]).toISOString().split("T")[0];

    if (!grouped[date]) {
      grouped[date] = [];
    }

    grouped[date].push(item);
  });

  return grouped;
};

export function formatDateTimeV1(dateTime) {
  const date = new Date(dateTime);
  const now = new Date();

  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  const diffDays = differenceInDays(now, date);

  if (diffDays < 7) return format(date, "EEEE");
  if (now.getFullYear() === date.getFullYear()) return format(date, "MMM d");

  return format(date, "yyyy, MMM d");
}
