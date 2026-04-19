import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "xyz",
  authDomain: "medical-billing-software.firebaseapp.com",
  projectId: "medical-billing-software",
  storageBucket: "medical-billing-software",
  messagingSenderId: "hey hello",
  appId: "hey"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
