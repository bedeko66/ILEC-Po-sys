const express = require('express');
const invoiceRouter = express.Router();
const { checkAuthenticated } = require('../../middlewares/middlewares');
const { addInvoice, getAllInvoices, getInvoice, updateInvoice, deleteInvoice } = require('../../controllers/invoiceController');

invoiceRouter.get('/get-invoices', function(req, res) {

    res.render('dashboard', { invoice })
});


invoiceRouter.post('/invoice', addInvoice);
// invoiceRouter.get('/invoices', getAllInvoices);
invoiceRouter.get('/invoice/:id', getInvoice);
invoiceRouter.put('/invoice/:id', updateInvoice);
invoiceRouter.delete('/invoice/:id', deleteInvoice);

module.exports = invoiceRouter;