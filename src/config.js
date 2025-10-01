import { convertToJson } from "./utils/helpers";

const CONFIG = {
  API_BASE_URL: process.env.REACT_APP_API_URL,
  ARSONGS_AI_API_URL: process.env.REACT_APP_ARSONGS_AI_API_URL,
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
    {
      id: "CODE",
      name: "DevMind",
      description: "Best for coding and technical tasks",
    },
    {
      id: "ARHYTHM_ASSISTANT",
      name: "Arhythm",
      description: "Connected to Arhythm Database",
    },
    {
      id: "SYNAPSE_HRMS_ASSISTANT",
      name: "Synapse HRMS",
      description: "Connected to Synapse HRMS Database",
    },
  ],

  AI_DEFAULT_TYPE: null,

  AI_MODELS: {
    TEXT: {
      models: [
        {
          id: "claude-opus-4@20250514",
          name: "Noney 1.0 Twinkle",
          google_search: false,
          active: "True",
          from: "NONEY",
          description: "High-end and smart.",
        },
        {
          id: "gemini-2.5-pro-preview-05-06",
          name: "Noney 1.0 Pro",
          google_search: true,
          active: "True",
          from: "NONEY",
          description: "Advanced and powerful.",
        },
        {
          id: "gemini-2.5-flash-preview-05-20",
          name: "Gemini 2.5 Flash",
          google_search: true,
          active: "True",
          from: "GEMINI",
          description: "Fast, smart, and web-ready.",
        },
        {
          id: "claude-sonnet-4@20250514",
          name: "Claude Sonnet 4",
          google_search: false,
          active: "True",
          from: "CLAUDE",
          description: "Smooth and balanced.",
        },
      ],
      default_model: null,
    },
    CODE: {
      models: [
        {
          id: "claude-opus-4-1@20250805",
          name: "Star Coder",
          google_search: false,
          active: "True",
          from: "NONEY",
          description: "Improved creativity and coding.",
        },
        {
          id: "claude-opus-4@20250514",
          name: "Noney 1.0 Twinkle",
          google_search: false,
          active: "True",
          from: "NONEY",
          description: "High-end and smart.",
        },
        {
          id: "claude-sonnet-4@20250514",
          name: "Claude Sonnet 4",
          google_search: false,
          active: "True",
          from: "CLAUDE",
          description: "Smooth and balanced.",
        },
      ],
      default_model: null,
    },
    ARHYTHM_ASSISTANT: {
      models: [
        {
          id: "noney-arhythm-1.0@20241001",
          name: "Arhythm Assistant",
          google_search: false,
          active: "True",
          from: "NONEY",
          description: "For basic search and stats.",
        },
      ],
      default_model: null,
    },
    SYNAPSE_HRMS_ASSISTANT: {
      models: [
        {
          id: "noney-synapses-1.0@20241001",
          name: "Synapse HRMS Assistant",
          google_search: false,
          active: "True",
          from: "NONEY",
          description: "For HRMS related queries.",
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
CONFIG.AI_MODELS.CODE.default_model = CONFIG.AI_MODELS.CODE.models[0];
CONFIG.AI_MODELS.ARHYTHM_ASSISTANT.default_model =
  CONFIG.AI_MODELS.ARHYTHM_ASSISTANT.models[0];
CONFIG.AI_MODELS.SYNAPSE_HRMS_ASSISTANT.default_model =
  CONFIG.AI_MODELS.SYNAPSE_HRMS_ASSISTANT.models[0];
CONFIG.AI_DEFAULT_TYPE =
  convertToJson(localStorage.getItem("AI_DEFAULT_TYPE")) || CONFIG.AI_TYPES[0];

export default CONFIG;
