const express = require('express');
const documentRouter = express.Router();
const { addDocument, getAllDocuments, getDocument, updateDocument, deletePo, getPurchaseOrder, updatePurchaseOrder } = require('../../controllers/documentsController');


documentRouter.post('/invoice', addDocument);
documentRouter.get('/invoices', getAllDocuments);
documentRouter.get('/invoice/:id', getDocument);
documentRouter.put('/invoice/:id', updateDocument);


documentRouter.get('/purchase-order/:id', getPurchaseOrder);
documentRouter.delete('/delete/:id', deletePo);
documentRouter.put('/purchase-order/:po_uid', updatePurchaseOrder);


module.exports = documentRouter;