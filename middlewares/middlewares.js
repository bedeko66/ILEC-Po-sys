require('dotenv').config()

function notFound(req, res, next) {
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}

function errorHandler(error, req, res, next) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        status: statusCode,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? "🐨🐨" : error.stack,
        errors: error.errors || undefined,
    });
}
// const { OAuth2Client } = require('google-auth-library');
// const client = new OAuth2Client(process.env.CLIENT_ID);

// function checkAuthenticated(req, res, next) {
//     let token = req.cookies['session-token'];

//     let user = {};
//     async function verify() {
//         const ticket = await client.verifyIdToken({
//             idToken: token,
//             audience: process.env.CLIENT_ID,
//         });
//         const payload = ticket.getPayload();
//         user.name = payload.name;
//         user.email = payload.email;
//         user.picture = payload.picture;
//     }
//     verify()
//         .then(() => {
//             if (user.email === 'h5623cc@gmail.com') {
//                 req.user = user;
//                 next();
//             } else {
//                 // res.send('Unauthorized email')
//                 res.redirect('/')
//             }
//         })
//         .catch(err => {
//             res.redirect('/')
//         })
// }

module.exports = {
    // client,
    // checkAuthenticated,
    notFound,
    errorHandler,
};