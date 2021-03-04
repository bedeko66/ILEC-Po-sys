const express = require('express');
const appRouter = express.Router();


const authRouter = require('./auth/authRoutes');
const invoiceRouter = require('./invoices/invoiceRoutes');
const invValidatorRouter = require('./invoiceValidator/invValidatorRoutes');
const purchaseOrderRouter = require('./purchase-orders/poRoutes');


appRouter.use("/", authRouter);
appRouter.use("/", invoiceRouter);
appRouter.use("/", invValidatorRouter);
appRouter.use("/", purchaseOrderRouter);



module.exports = appRouter;