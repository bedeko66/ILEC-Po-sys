const express = require('express');
const documentRouter = express.Router();
const { addInvoice, getAllInvoices_, getInvoice, updateInvoice, deletePo, getPurchaseOrder } = require('../../controllers/documentsController');


documentRouter.post('/invoice', addInvoice);
documentRouter.get('/invoices', getAllInvoices_);
documentRouter.get('/invoice/:id', getInvoice);
documentRouter.put('/invoice/:id', updateInvoice);

documentRouter.get('/purchase-order/:id', getPurchaseOrder);
documentRouter.delete('/delete/:id', deletePo);

module.exports = documentRouter;