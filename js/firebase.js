// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyACADaYjlCizM7DzwpEynVuANMq4ZTDIWU",
  authDomain: "oh-kasyon.firebaseapp.com",
  databaseURL: "https://oh-kasyon-default-rtdb.firebaseio.com",
  projectId: "oh-kasyon",
  storageBucket: "oh-kasyon.appspot.com",
  messagingSenderId: "81723234747",
  appId: "1:81723234747:web:4ce8092f4861402a678c9e",
  measurementId: "G-4ZJ9EM3DH8"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storageRef = firebase.storage().ref();
const storage = firebase.storage();

db.settings({ timestampsInSnapshots: true });

firebase.firestore().enablePersistence()
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          // ...
      } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
      }
  });
// Subsequent queries will use persistence, if it was enabled successfully
