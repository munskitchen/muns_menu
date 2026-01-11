import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "여기에_apiKey",
  authDomain: "여기에_authDomain",
  projectId: "muns-kitchen-menu",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);