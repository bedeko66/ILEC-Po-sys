require('dotenv').config()

//Google Auth
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const authorizedUsers = require('./users.json');
const registeredUser = (visitor) => {
    let isRegistered = false;

    authorizedUsers.forEach(user => {
        if (user.email === visitor) return isRegistered = true;
    });

    return isRegistered;
}


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
            if (registeredUser(user.email)) {
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