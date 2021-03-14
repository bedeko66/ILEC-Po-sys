const express = require('express');
const appRouter = express.Router();
const { checkGuest } = require('../middlewares/auth');

const authRouter = require('./auth/authRoutes');
const documentRouter = require('./documents/documentRoutes');
const invValidatorRouter = require('./invoiceValidator/invValidatorRoutes');
const purchaseOrderRouter = require('./purchase-orders/poRoutes');


appRouter.get('/', checkGuest, function(req, res) {
    res.render('index.ejs')
});

appRouter.get('/unauthorized', checkGuest, function(req, res) {
    req.session.destroy(function() {
        res.clearCookie('connect.sid');
        res.render('error/unauthorized')
    });
});

appRouter.use("/auth", authRouter);
appRouter.use("/", documentRouter);
appRouter.use("/", invValidatorRouter);
appRouter.use("/", purchaseOrderRouter);



module.exports = appRouter;