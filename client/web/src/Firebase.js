import firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import mockFirebaseSdk from './tests/firebaseMockSDK';

// firebase config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASEURL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECTID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_FIREBASE_APPID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENTID
};
firebase.initializeApp(firebaseConfig);
if (process.env.NODE_ENV !== 'test') {
  firebase.analytics();
}

const firebaseApiKey = firebaseConfig.apiKey;
export {firebaseApiKey};

const firebaseSdk = process.env.NODE_ENV === 'test' ? mockFirebaseSdk : firebase;

export default firebaseSdk;