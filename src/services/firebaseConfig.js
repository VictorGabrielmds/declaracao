import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0VpDP1o6DByYhwx9EfnPYn7yotBdYaNc",
  authDomain: "portaldedeclaracoessvt.firebaseapp.com",
  projectId: "portaldedeclaracoessvt",
  storageBucket: "portaldedeclaracoessvt.firebasestorage.app",
  messagingSenderId: "17874521497",
  appId: "1:17874521497:web:27f9d4536ac30ba3ea1708",
};

const firebaseApp = initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);
export default firebaseApp;
