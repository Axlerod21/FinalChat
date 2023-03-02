import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const provider = new firebase.auth.GoogleAuthProvider();

const firebaseConfig = {
  apiKey: "AIzaSyA9wfr6h9We0pbwliXUWeg9NcIfXESgNSY",
  authDomain: "chatify-9d265.firebaseapp.com",
  projectId: "chatify-9d265",
  storageBucket: "chatify-9d265.appspot.com",
  messagingSenderId: "640140883747",
  appId: "1:640140883747:web:99a601540bbfb057ac7e96"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, provider, storage };
