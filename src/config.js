const CONFIG = {
  API_BASE_URL: process.env.REACT_APP_API_URL,
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
  },

  NEW_CHAT_DRAFT_ID: "new_chat_draft",
  DRAFT_SAVE_DEBOUNCE_MS: 300,
  MAX_PROMPT_LENGTH: 10000,

  GOOGLE_ICON_IMAGE_LOAD_API_64: (domain) =>
    `https://www.google.com/s2/favicons?sz=64&domain=${domain}`,
};

export default CONFIG;
