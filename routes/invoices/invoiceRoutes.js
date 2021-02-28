const express = require('express');
const invoiceRouter = express.Router();
const { checkAuthenticated } = require('../../middlewares/middlewares');
const { addInvoice, getAllInvoices_, getInvoice, updateInvoice, deleteInvoice } = require('../../controllers/invoiceController');


invoiceRouter.post('/invoice', addInvoice);
invoiceRouter.get('/invoices', getAllInvoices_);
invoiceRouter.get('/invoice/:id', getInvoice);
invoiceRouter.put('/invoice/:id', updateInvoice);
invoiceRouter.delete('/invoice/:id', deleteInvoice);

module.exports = invoiceRouter;