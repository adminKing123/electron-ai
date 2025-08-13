import { marked } from "marked";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import { getCopiableAnswer } from "./getCopiableAnswer";

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

export const scrollToMessageTop = (id, duration = 100, behavior = "smooth") => {
  setTimeout(() => {
    const messageEle = document.getElementById(id);
    const container = document.getElementById("messages-container");
    if (messageEle && container) {
      const topPos = messageEle.offsetTop - 100;
      container.scrollTo({
        top: topPos,
        behavior: behavior,
      });
    }
  }, duration);
};

export const focusPromptTextArea = (moveCursor, duration = 10) => {
  const textarea = document.getElementById("prompt-textarea");
  textarea?.focus();

  if (textarea && moveCursor === "last") {
    setTimeout(() => {
      const textLength = textarea.value.length;
      textarea.setSelectionRange(textLength, textLength);
      textarea.scrollTop = textarea?.scrollHeight;
    }, duration);
  }
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

export const copyAnswer = async (message, callback) => {
  if (message?.answer) {
    const plainText = getCopiableAnswer(message.answer);

    try {
      const html = marked.parse(plainText);

      const clipboardItem = new ClipboardItem({
        "text/plain": new Blob([plainText], { type: "text/plain" }),
        "text/html": new Blob([html], { type: "text/html" }),
      });

      await navigator.clipboard.write([clipboardItem]);
      callback?.(message?.id);
    } catch (error) {
      navigator.clipboard.writeText(plainText);
      callback?.(message?.id);
    }
  }
};

export const validate_chart_data = (data) => {
  if (typeof data !== "string") return null;
  let trimmedData = data.trim();
  const fenceMatch = trimmedData.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) {
    trimmedData = fenceMatch[1].trim();
  }
  try {
    const parsed = JSON.parse(trimmedData);
    return parsed && parsed.meta_data && parsed.data
      ? {
          valid: true,
          chart_data: parsed,
        }
      : {
          valid: false,
          chart_data: data,
        };
  } catch (err) {
    return {
      valid: false,
      chart_data: data,
    };
  }
};
