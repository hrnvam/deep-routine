import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyA2zOo0LHHrrSU6q0QbvQS3HWx1fYRBVhI",
  authDomain: "deeproutine-ec6d2.firebaseapp.com",
  projectId: "deeproutine-ec6d2",
  storageBucket: "deeproutine-ec6d2.firebasestorage.app",
  messagingSenderId: "77733087657",
  appId: "1:77733087657:web:0afaa18d2c5744cfc1dcb8"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);