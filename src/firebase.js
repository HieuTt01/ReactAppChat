import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";


var firebaseConfig = {
    apiKey: "AIzaSyDsNBfQLLhFlplb2phonOA4nO9GkggxKn4",
    authDomain: "react-slack-clone-709ea.firebaseapp.com",
    databaseURL: "https://react-slack-clone-709ea.firebaseio.com",
    projectId: "react-slack-clone-709ea",
    storageBucket: "react-slack-clone-709ea.appspot.com",
    messagingSenderId: "9784197092",
    appId: "1:9784197092:web:747c8b2071ae35887611f1",
    measurementId: "G-SVRJ4E7P9H"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  

export default firebase;