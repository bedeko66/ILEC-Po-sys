const firebase = require('firebase');

var firebaseConfig = {
    apiKey: "AIzaSyDrRpOsNMcu7eoI7GlofxZnI_wN98MrWc0",
    authDomain: "po-sys.firebaseapp.com",
    projectId: "po-sys",
    storageBucket: "po-sys.appspot.com",
    messagingSenderId: "431439752621",
    appId: "1:431439752621:web:0c81c35e77eb1f4a100524",
    measurementId: "G-2H6TZKBDC1"
};

const firebaseDb = firebase.initializeApp(firebaseConfig);

module.exports = firebaseDb;