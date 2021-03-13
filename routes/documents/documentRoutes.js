const express = require('express');
const documentRouter = express.Router();
const { addDocument, getAllDocuments, getDocument, updateDocument, deletePo, getPurchaseOrder, updatePurchaseOrder } = require('../../controllers/documentsController');
const { checkAuthenticated } = require('../../middlewares/auth');

documentRouter.post('/invoice', checkAuthenticated, addDocument);
documentRouter.get('/invoices', checkAuthenticated, getAllDocuments);
documentRouter.get('/invoice/:id', checkAuthenticated, getDocument);

documentRouter.get('/purchase-order/:id', checkAuthenticated, getPurchaseOrder);
documentRouter.delete('/delete/:id', checkAuthenticated, deletePo);


module.exports = documentRouter;