const CONFIG = {
  API_BASE_URL: process.env.REACT_APP_API_URL,
  GET_GENERATE_URL: function (data) {
    let endpoint = "/generate";
    if (data.generate_image) endpoint = "/generate-image";
    return `${this.API_BASE_URL}${endpoint}`;
  },
  DEFAULT_USER: {
    uid: process.env.REACT_APP_DEFAULT_USER_UID,
    org_id: process.env.REACT_APP_DEFAULT_USER_ORG_ID,
  },
  CALL_GET_AI_MODELS_API: false,
  FIREBASE_CONFIG: {
    apiKey: process.env.REACT_APP_APIKEY,
    authDomain: process.env.REACT_APP_AUTHDOMAIN,
    projectId: process.env.REACT_APP_PROJECTID,
    storageBucket: process.env.REACT_APP_STORAGEBUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
    appId: process.env.REACT_APP_APPID,
    measurementId: process.env.REACT_APP_MEASUREMENTID,
  },
};

export default CONFIG;
