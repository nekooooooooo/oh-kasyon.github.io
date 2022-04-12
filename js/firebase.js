// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "apiKey",
  authDomain: "authDomain",
  databaseURL: "databaseURL",
  projectId: "oh-kasyon",
  storageBucket: "oh-kasyon.appspot.com",
  messagingSenderId: "messagingSenderId",
  appId: "appId",
  measurementId: "measurementId"
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
