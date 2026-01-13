import { convertToJson } from "./utils/helpers";

const CONFIG = {
  API_BASE_URL: process.env.REACT_APP_API_URL,
  FILE_CDN_URL: process.env.REACT_APP_FILE_CDN_URL,
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

  AI_TYPES: [
    {
      id: "TEXT",
      name: "Conversa",
      description: "Best for general-purpose use",
    },
    {
      id: "CODE",
      name: "Coder",
      description: "Best for coding tasks",
    },
    {
      id: "HRMS_ASSISTANT_1_0",
      name: "HRMS Assistant 1.0",
      description: "@Synapses XTL",
    },
  ],

  AI_DEFAULT_TYPE: null,

  AI_MODELS: {
    TEXT: {
      models: [
        {
          id: "noney-1.0-twinkle-20241001",
          name: "Spiral 1.0 Twinkle",
          google_search: false,
          active: "True",
          from: "NONEY",
          description: "High-end and smart.",
        },
        {
          id: "noney-2.0-twinkle-20241001",
          name: "Spiral 2.0 Twinkle",
          google_search: false,
          active: "True",
          from: "NONEY",
          description: "Next-gen improved.",
        },
      ],
      default_model: null,
    },
    CODE: {
      models: [
        {
          id: "noney-code-gen-20241001",
          name: "Spiral Code Gen1.0",
          google_search: false,
          active: "True",
          from: "NONEY",
          description: "Powerful code generation model.",
        },
        {
          id: "noney-code-gen-pro-20241001",
          name: "Spiral Code Gen Pro",
          google_search: false,
          active: "True",
          from: "NONEY",
          description: "Advanced code generation.",
        }        
      ],
      default_model: null,
    },
    HRMS_ASSISTANT_1_0: {
      models: [
        {
          id: "noney-hrms-assistant-20241001",
          name: "HRMS Assistant 1.0",
          google_search: false,
          active: "True",
          from: "NONEY",
          description: "Easy-going and quick.",
        },
        {
          id: "noney-hrms-assistant-pro-20241001",
          name: "HRMS Assistant Pro",
          google_search: false,
          active: "True",
          from: "NONEY",
          description: "Heavy-duty but accurate.",
        },
      ],
      default_model: null,
    },
  },

  NEW_CHAT_DRAFT_ID: "new_chat_draft",
  DRAFT_SAVE_DEBOUNCE_MS: 300,
  MAX_PROMPT_LENGTH: 100000,
  CHATS_PAGE_SIZE: 15,
  CHATS_SCROLL_THRESHOLD: 10,

  GOOGLE_ICON_IMAGE_LOAD_API_64: (domain) =>
    `https://www.google.com/s2/favicons?sz=64&domain=${domain}`,
};

CONFIG.AI_MODELS.TEXT.default_model = CONFIG.AI_MODELS.TEXT.models[0];
CONFIG.AI_MODELS.CODE.default_model = CONFIG.AI_MODELS.CODE.models[0];
CONFIG.AI_MODELS.HRMS_ASSISTANT_1_0.default_model =
  CONFIG.AI_MODELS.HRMS_ASSISTANT_1_0.models[0];

CONFIG.AI_DEFAULT_TYPE =
  convertToJson(localStorage.getItem("AI_DEFAULT_TYPE")) || CONFIG.AI_TYPES[0];

export default CONFIG;
