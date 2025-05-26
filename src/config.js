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
    apiKey: "AIzaSyAoe4VpGoJA0RZHWvTji7__eSnVCTZ29ek",
    authDomain: "electron-ai-dc720.firebaseapp.com",
    projectId: "electron-ai-dc720",
    storageBucket: "electron-ai-dc720.firebasestorage.app",
    messagingSenderId: "508739640467",
    appId: "1:508739640467:web:f0127c23b10da7e8fc8166",
    measurementId: "G-3H1H3BRE2J",
  },
};

export default CONFIG;
