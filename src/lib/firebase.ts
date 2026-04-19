import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBe4MmSEYjcY-c2xJSg7cLrPVV7oMVUKE4",
  authDomain: "medical-billing-software.firebaseapp.com",
  projectId: "medical-billing-software",
  storageBucket: "medical-billing-software.firebasestorage.app",
  messagingSenderId: "567229238703",
  appId: "1:567229238703:web:af282ea784aaac91a1b35a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
