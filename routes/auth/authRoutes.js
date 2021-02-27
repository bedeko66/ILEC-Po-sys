const express = require('express');
const authRouter = express.Router();

const client = require('../../config/googleAuth')
require('dotenv').config()

// //Google Auth
// const { OAuth2Client } = require('google-auth-library');
// const client = new OAuth2Client(process.env.CLIENT_ID);


authRouter.get('/', function(req, res) {
    res.clearCookie('session-token');
    res.redirect('/login')
});

authRouter.get('/login', function(req, res) {
    res.render('index.ejs')
});

authRouter.post('/login', function(req, res) {
    let token = req.body.token;

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];

    }

    verify()
        .then((() => {
            res.cookie('session-token', token);
            res.send('success');
        })).catch(console.error);
})


authRouter.get('/logout', function(req, res) {
    res.clearCookie('session-token');
    res.redirect('/login')
});

module.exports = authRouter;