import { convertToJson } from "./utils/helpers";

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

  AI_TYPES: [
    {
      id: "TEXT",
      name: "Conversa",
      description: "Best for general-purpose use",
    },
  ],

  AI_DEFAULT_TYPE: null,

  AI_MODELS: {
    TEXT: {
      models: [
        {
          id: "noney-1.0-twinkle-20241001",
          name: "Noney 1.0 Twinkle",
          google_search: false,
          active: "True",
          from: "NONEY",
          description: "High-end and smart.",
        },
      ],
      default_model: null,
    },
  },

  NEW_CHAT_DRAFT_ID: "new_chat_draft",
  DRAFT_SAVE_DEBOUNCE_MS: 300,
  MAX_PROMPT_LENGTH: 10000,

  GOOGLE_ICON_IMAGE_LOAD_API_64: (domain) =>
    `https://www.google.com/s2/favicons?sz=64&domain=${domain}`,
};

CONFIG.AI_MODELS.TEXT.default_model = CONFIG.AI_MODELS.TEXT.models[0];
CONFIG.AI_DEFAULT_TYPE =
  convertToJson(localStorage.getItem("AI_DEFAULT_TYPE")) || CONFIG.AI_TYPES[0];

export default CONFIG;
