const fs = require('fs');
const express = require('express');
const purchaseOrderRouter = express.Router();
const { checkAuthenticated } = require('../../middlewares/auth');
const { getAllPurchaseOrders, filterAwaitingPurchaseOrders } = require('../../controllers/documentsController')
const PurchaseOrder = require('../../models/PurchaseOrder')
const { produce } = require('immer')

function copyInvoiceToTemplates(src, dest) {
    fs.copyFile(src, dest, (err) => {
        if (err) { throw err } else {
            console.log(`${src} was copied to ${dest}`);
        }
    });
}

function convertItemsType(po) {
    return produce(po, draftPo => {
        draftPo.po_ttl = parseFloat(draftPo.po_ttl)
        let dO;
        draftPo.itemsArr = draftPo.itemsArr.map(item => {
            dO = {
                item_descr: item.item_descr,
                item_qty: parseFloat(item.item_qty),
                item_net: parseFloat(item.item_net),
                item_vat: parseFloat(item.item_vat),
                item_gross: parseFloat(item.item_gross)
            }
            return dO
        })

    })
}


purchaseOrderRouter.get('/purchase-orders', checkAuthenticated, async function(req, res) {
    try {
        let user = req.user;
        console.log(user);
        const pos = await getAllPurchaseOrders(user.lastName);
        console.log(pos)
        const unmatchedPos = filterAwaitingPurchaseOrders(pos)
        console.log(unmatchedPos);
        res.render('purchase-orders', { user, unmatchedPos })

    } catch (error) {
        console.log(error);
        res.render('error/500')
    }

});

purchaseOrderRouter.get('/po-creator', checkAuthenticated, async function(req, res) {
    let user = req.user;
    res.render('po-creator', { user });
});

purchaseOrderRouter.post('/add-purchase-order', checkAuthenticated, async function(req, res) {
    try {
        copyInvoiceToTemplates(req.body.src, req.body.dest)
        const _po = convertItemsType(req.body.purchaseOrder)
        const updated = await new PurchaseOrder(_po)
        await updated.save()
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(500).send(error);

    }
});

purchaseOrderRouter.get('/download-po', function(req, res) {
    res.download(process.cwd() + '/static/templates/output.pdf', 'my-purchase-order.pdf');
})

purchaseOrderRouter.get('/download-po/:file_name', function(req, res) {
    res.download(process.cwd() + '/static/documents/purchase-orders/' + req.params.file_name, req.params.file_name);
})


module.exports = purchaseOrderRouter;