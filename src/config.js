import { convertToJson } from "./utils/helpers";

const CONFIG = {
  API_BASE_URL: process.env.REACT_APP_API_URL,
  FILE_CDN_URL: process.env.REACT_APP_FILE_CDN_URL,
  FILE_CDN_URL_2: process.env.REACT_APP_FILE_CDN_URL_2,
  SUPER_ADMIN_EMAIL: process.env.REACT_APP_SUPER_ADMIN_EMAIL || "",
  CHECK_RUNNING_STATUS:
    process.env.REACT_APP_CHECK_RUNNING_STATUS === undefined
      ? true
      : process.env.REACT_APP_CHECK_RUNNING_STATUS === "true",

  FIREBASE_CONFIG: {
    apiKey: process.env.REACT_APP_APIKEY,
    authDomain: process.env.REACT_APP_AUTHDOMAIN,
    projectId: process.env.REACT_APP_PROJECTID,
    storageBucket: process.env.REACT_APP_STORAGEBUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
    appId: process.env.REACT_APP_APPID,
    measurementId: process.env.REACT_APP_MEASUREMENTID,
  },

  PROMPT_ACTION_TYPES: {
    EDIT: "EDIT",
    INTERRUPT_CONTINUE: "INTERRUPT_CONTINUE",
  },

  NEW_CHAT_DRAFT_ID: "new_chat_draft",
  DRAFT_SAVE_DEBOUNCE_MS: 300,
  MAX_PROMPT_LENGTH: 1048576,
  CHATS_PAGE_SIZE: 24,
  CHATS_SCROLL_THRESHOLD: 10,

  FILES_PAGE_SIZE: 1000,

  GOOGLE_ICON_IMAGE_LOAD_API_64: (domain) =>
    `https://www.google.com/s2/favicons?sz=64&domain=${domain}`,
};

export default CONFIG;
