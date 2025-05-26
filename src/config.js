const CONFIG = {
  API_BASE_URL: "https://pa-dev-api.thesynapses.com",
  GET_GENERATE_URL: function (data) {
    let endpoint = "/generate";
    if (data.generate_image) endpoint = "/generate-image";
    return `${this.API_BASE_URL}${endpoint}`;
  },
  DEFAULT_USER: {
    uid: "un2xqHu71cd6WWycTr1P6UE4PiJ2",
    org_id: "synapses",
  },
  CALL_GET_AI_MODELS_API: false,
  FIREBASE_CONFIG: {
    apiKey: process.env.APIKEY,
    authDomain: process.env.AUTHDOMAIN,
    projectId: process.env.PROJECTID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGINGSENDERID,
    appId: process.env.APPID,
    measurementId: process.env.MEASUREMENTID,
  },
};

export default CONFIG;
