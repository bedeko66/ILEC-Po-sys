const firebase = require('firebase');
require('dotenv').config();

var firebaseConfig = {
    apiKey: process.env.FB_APIKEY,
    authDomain: process.env.FB_AUTHDOMAIN,
    projectId: process.env.FB_PROJECT_ID,
    storageBucket: process.env.FB_STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGINGSENDERID,
    appId: process.env.FB_APP_ID,
    measurementId: process.env.MEASUREMENT_ID
};

const firebaseDb = firebase.initializeApp(firebaseConfig);

module.exports = firebaseDb;