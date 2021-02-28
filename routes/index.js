const express = require('express');
const appRouter = express.Router();


const authRouter = require('./auth/authRoutes');
const invoiceRouter = require('./invoices/invoiceRoutes');
const invValidatorRouter = require('./invoiceValidator/invValidatorRoutes');


appRouter.use("/", authRouter);
appRouter.use("/", invoiceRouter);
appRouter.use("/", invValidatorRouter);



module.exports = appRouter;