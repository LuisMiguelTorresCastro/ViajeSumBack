// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB2Fmol6E5uJvzNruz4fQTsbpCZiBuXL5k",
  authDomain: "viajesum-f4439.firebaseapp.com",
  projectId: "viajesum-f4439",
  storageBucket: "viajesum-f4439.firebasestorage.app",
  messagingSenderId: "837854188408",
  appId: "1:837854188408:web:a2747055ece892313f6e8d",
  measurementId: "G-87P0NV4C5Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);