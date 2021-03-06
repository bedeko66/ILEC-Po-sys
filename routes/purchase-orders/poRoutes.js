const fs = require('fs');
const express = require('express');
const purchaseOrderRouter = express.Router();
const { checkAuthenticated } = require('../../config/googleAuth');
const { getAllPurchaseOrders } = require('../../controllers/documentsController')

const firebaseDb = require('../../config/firebase');
const firestore = firebaseDb.firestore();



purchaseOrderRouter.get('/purchase-orders', checkAuthenticated, async function(req, res) {
    let user = req.user;
    const pos = await getAllPurchaseOrders(user);
    res.render('purchase-orders', { user, pos })
});

purchaseOrderRouter.get('/po-creator', checkAuthenticated, async function(req, res) {
    let user = req.user;
    res.render('po-creator', { user });
});

purchaseOrderRouter.post('/add-purchase-order', checkAuthenticated, async function(req, res) {
    try {
        const data = req.body.purchaseOrder;
        await firestore.collection('purchase-orders').doc().set(data);
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);

    }
});

purchaseOrderRouter.get('/download-po', function(req, res) {
    res.download(process.cwd() + '/static/templates/output.pdf', 'my-purchase-order.pdf');
})

purchaseOrderRouter.get('/download-po/:file_name', function(req, res) {
    res.download(process.cwd() + '/static/purchase-orders/' + req.params.file_name, req.params.file_name);
})


module.exports = purchaseOrderRouter;