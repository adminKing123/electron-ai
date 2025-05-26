import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import CONFIG from "../config";

const app = initializeApp(CONFIG.FIREBASE_CONFIG);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
