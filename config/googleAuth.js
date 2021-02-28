//Google Auth
require('dotenv').config()

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

function checkAuthenticated(req, res, next) {
    let token = req.cookies['session-token'];

    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
    }
    verify()
        .then(() => {
            if (user.email === 'h5623cc@gmail.com') {
                req.user = user;
                next();
            } else {
                // res.send('Unauthorized email')
                // res.redirect('/')
                next();
            }
        })
        .catch(err => {
            res.redirect('/')
        })
}

module.exports = {
    client,
    checkAuthenticated
};