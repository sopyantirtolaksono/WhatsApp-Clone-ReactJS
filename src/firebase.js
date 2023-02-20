import { initializeApp } from "firebase/app";
import {
    getFirestore, getDocs, getDoc, collection, collectionGroup, addDoc, deleteDoc, updateDoc, doc, query, where, orderBy, onSnapshot, serverTimestamp
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAdnPDUNUfuj5x0EW31sLTdXIigIlhz9FA",
    authDomain: "whatsapp-clone-7a4f3.firebaseapp.com",
    projectId: "whatsapp-clone-7a4f3",
    storageBucket: "whatsapp-clone-7a4f3.appspot.com",
    messagingSenderId: "1037884379059",
    appId: "1:1037884379059:web:92d82a781e1324b4a905c6",
    measurementId: "G-BCNWHWDNL5"
};

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//     apiKey: "AIzaSyBSPXQUQGnZQDmqbk3iJChD_0god1blTNI",
//     authDomain: "whatsapp-clone-v2-15b5c.firebaseapp.com",
//     projectId: "whatsapp-clone-v2-15b5c",
//     storageBucket: "whatsapp-clone-v2-15b5c.appspot.com",
//     messagingSenderId: "720004113096",
//     appId: "1:720004113096:web:eed86f9cec21c694ddbbfd",
//     measurementId: "G-WGLMG59FQJ"
// };

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

export {
    auth, provider, signInWithPopup, signOut, getDocs, getDoc, collection, collectionGroup, addDoc, deleteDoc, updateDoc, doc, query, where, orderBy, onSnapshot, serverTimestamp
};
export default db;