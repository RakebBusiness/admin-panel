
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyA2-bGZGBWIkcAUua79zXnZnXEvxIOnBX4",
  authDomain: "rakeb-1f7fb.firebaseapp.com",
  projectId: "rakeb-1f7fb",
  storageBucket: "rakeb-1f7fb.firebasestorage.app",
  messagingSenderId: "811288660621",
  appId: "1:811288660621:web:861641b5dad87669a5f0c4",
  measurementId: "G-S3T82S85CR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
