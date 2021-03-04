const express = require('express');
const appRouter = express.Router();


const authRouter = require('./auth/authRoutes');
const documentRouter = require('./documents/documentRoutes');
const invValidatorRouter = require('./invoiceValidator/invValidatorRoutes');
const purchaseOrderRouter = require('./purchase-orders/poRoutes');


appRouter.use("/", authRouter);
appRouter.use("/", documentRouter);
appRouter.use("/", invValidatorRouter);
appRouter.use("/", purchaseOrderRouter);



module.exports = appRouter;