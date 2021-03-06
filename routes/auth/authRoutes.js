const express = require('express');
const authRouter = express.Router();
const passport = require('passport');

//Google auth
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', "email"] }))

authRouter.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/unauthorized' }),
    (req, res) => {
        res.redirect('/dashboard')
    }
)

authRouter.get('/logout', (req, res) => {
    req.session.destroy(function() {
        req.logout()
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
})


module.exports = authRouter;