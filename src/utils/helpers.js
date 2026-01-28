import { marked } from "marked";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import { getCopiableAnswer } from "./getCopiableAnswer";
import {
  MdAudioFile,
  MdCode,
  MdDescription,
  MdFolderZip,
  MdInsertDriveFile,
  MdPictureAsPdf,
  MdTableChart,
  MdTextSnippet,
  MdVideoFile,
} from "react-icons/md";

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

export const copyText = async (text, callback) => {
  await navigator.clipboard.writeText(text);
  callback?.();
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

export function convertToJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export const getFileIcon = (file) => {
  const fileName = file.name.toLowerCase();
  const extension = fileName.split(".").pop();

  if (extension === "pdf") return MdPictureAsPdf;
  if (["mp3", "wav", "ogg", "m4a", "flac", "aac"].includes(extension))
    return MdAudioFile;
  if (["mp4", "avi", "mov", "wmv", "flv", "mkv", "webm"].includes(extension))
    return MdVideoFile;
  if (["xlsx", "xls", "csv", "ods"].includes(extension)) return MdTableChart;
  if (["doc", "docx", "odt", "rtf"].includes(extension)) return MdDescription;
  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension))
    return MdFolderZip;
  if (
    [
      "js",
      "jsx",
      "ts",
      "tsx",
      "py",
      "java",
      "cpp",
      "c",
      "cs",
      "php",
      "rb",
      "go",
      "rs",
      "swift",
      "kt",
    ].includes(extension)
  )
    return MdCode;
  if (["txt", "md", "json", "xml", "yml", "yaml", "log"].includes(extension))
    return MdTextSnippet;
  return MdInsertDriveFile;
};

export const convertByteToSize = (byte) => {
  const kb = byte / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
};

export const formartJSON = (value) => {
  try {
    return JSON.stringify(
      typeof value === "string" ? JSON.parse(value) : value,
      null,
      2,
    );
  } catch {
    return value;
  }
};

export const getClassNameWithAspectRatio = (aspectRatio) => {
  const ratio = aspectRatio || "1:1";
  switch (ratio) {
    case "1:1":
      return "w-full max-w-[400px] aspect-square";
    case "9:16":
      return "h-full max-h-[560px] aspect-[9/16]";
    case "16:9":
      return "w-full max-w-[600px] aspect-video";
    case "4:3":
      return "w-full max-w-[400px] aspect-[4/3]";
    case "3:4":
      return "h-full max-h-[560px] aspect-[3/4]";
    default:
      return "w-full max-w-[400px]";
  }
};

export const RENDERABLE_CONTENT_TYPES = {
  svg: {
    languages: ['svg', 'xml', 'html'],
    detector: (content) => {
      const trimmed = content.trim();
      return trimmed.startsWith('<svg') || /<svg[\s>]/i.test(trimmed);
    }
  },
};

export const detectRenderableContent = (lang, content) => {
  if (!lang || !content) return null;
  
  const normalizedLang = lang.toLowerCase();
  
  for (const [type, config] of Object.entries(RENDERABLE_CONTENT_TYPES)) {
    if (config.languages.includes(normalizedLang) && config.detector(content)) {
      return type;
    }
  }
  
  return null;
};
