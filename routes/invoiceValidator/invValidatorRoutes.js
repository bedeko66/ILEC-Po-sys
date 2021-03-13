const fs = require('fs');
const _ = require('lodash');
const express = require('express');
const invValidatorRouter = express.Router();
const Document = require('../../models/Document')
const PurchaseOrder = require('../../models/PurchaseOrder')
const User = require('../../models/User')
const { checkAuthenticated } = require('../../middlewares/auth');
const { getAllDocuments, getDocument, getAllPurchaseOrders, updateDocument, filterUnValidatedInvoices, filterAwaitingPurchaseOrders } = require('../../controllers/documentsController')
const multer = require('multer');
const { produce } = require('immer')

function copyOps(src, dest) {
    fs.copyFile(src, dest, (err) => {
        if (err) { throw err } else {
            console.log(`${src} was copied to ${dest}`);
        }
    });
}

function cloneExcludeId(po) {

    const poToUpdate = {
        document_user: po.document_user,
        supplier: po.supplier,
        manager: po.manager,
        department: po.department,
        orderDate: po.orderDate,
        comments: po.comments,
        status: po.status,
        po_signed_by: po.po_signed_by,
        po_signed_at: po.po_signed_at,
        po_ttl: po.po_ttl,
        file_name: po.file_name
    }
    let dO;
    const u_itemsArr = po.itemsArr.map(item => {
        dO = {
            item_descr: item.item_descr,
            item_qty: item.item_qty,
            item_net: item.item_net,
            item_vat: item.item_vat,
            item_gross: item.item_gross
        }
        return dO
    });
    poToUpdate.itemsArr = u_itemsArr;

    return poToUpdate;
}

invValidatorRouter.get('/dashboard', checkAuthenticated, async function(req, res) {
    try {
        let user = req.user;
        const invoices = await getAllDocuments(user);
        if (Object.keys(invoices).length === 0) {
            const invoicesToValidate = {}
            res.render('dashboard', { user, invoicesToValidate })
        } else {
            const invoicesToValidate = filterUnValidatedInvoices(invoices)
            res.render('dashboard', { user, invoicesToValidate })

        }

    } catch (error) {
        console.log(error);
        res.render('error/500')
    }
});

invValidatorRouter.get('/validated-docs', checkAuthenticated, async function(req, res) {
    try {
        let user = req.user;
        const invoices = await getAllDocuments(user);
        console.log(invoices);
        res.render('validated-docs', { user, invoices })

    } catch (error) {
        console.log(error);
        res.render('error/500')
    }
});

invValidatorRouter.get('/invoice-validator/:id', checkAuthenticated, async function(req, res) {
    try {

        let id = req.params.id;
        let invoice = await getDocument(id)
        let purchase_orders = await getAllPurchaseOrders(invoice.document_user)
        let unmatchedPos = filterAwaitingPurchaseOrders(purchase_orders)

        //copy invoice to templates
        let src = 'static/documents/to-validate/' + invoice.file_name;
        let dest = 'static/templates/orig_invoice.pdf';
        copyOps(src, dest)

        const user = await User.findOne({ lastName: { $eq: invoice.document_user } })
        res.render('invoice-validator', { user, invoice, id, unmatchedPos });

    } catch (error) {
        console.log(error);
        res.render('error/500')
    }
});

function convertItemsType(po) {
    return produce(po, draftPo => {
        if (draftPo.po_ttl) {
            draftPo.po_ttl = parseFloat(draftPo.po_ttl)
        }
        if (draftPo.itemsArr) {
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
        }

    })
}
invValidatorRouter.put('/invoice/:id', checkAuthenticated, async function(req, res) {
    try {
        const po = convertItemsType(req.body.purchaseOrder)
        console.log('129po', po)
        let response = await updateDocument(req.params.id, po)
        console.log('response from -in_upd->', response);

        //copy invoice to validated
        let src = 'static/templates/output2.pdf';
        let dest = 'static/documents/validated/' + req.body.filename;
        copyOps(src, dest)
        res.status(200).send(response)
    } catch (error) {
        console.log(error);
        res.render('error/500')
    }
});

invValidatorRouter.get('/download-validated/:file_name', function(req, res) {
    res.download(process.cwd() + '/static/documents/validated/' + req.params.file_name, req.params.file_name);
})



invValidatorRouter.post('/generate-purchase-order', function(req, res) {
    let purchaseOrder = JSON.stringify(req.body.purchaseOrder);


    const { spawn } = require('child_process');
    const poPdfpy = spawn('python3', [process.cwd() + '/utils/po_to_pdf_merge.py', purchaseOrder, req.body.from]);

    poPdfpy.stdout.on('data', function(data) {
        console.log(data.toString());
        res.write(data);
        res.end('end');
    });

})

invValidatorRouter.post('/merge-from-existing-purchase-order', async function(req, res) {
    try {
        //Copy po to templates
        let src = 'static/documents/purchase-orders/' + req.body.poId + '.pdf';
        let dest = 'static/templates/purchase-order.pdf';
        // fs.copyFileSync(src, dest);
        copyOps(src, dest)

        //Get po to update
        const po = await PurchaseOrder.findById(req.body.id);

        if (!po) {
            console.log('Purchase Order with the given ID not found');
        } else {
            //Update document with po
            const poToUpdate = cloneExcludeId(po)
            const response = await updateDocument(req.body.invoice_id, poToUpdate)
            console.log(response);
            res.status(200).send(response)

        }

        // merge
        const { spawn } = require('child_process');
        const poPdfpy = spawn('python3', [process.cwd() + '/utils/merge_from_existing_po.py']);

        poPdfpy.stdout.on('data', function(data) {
            console.log(data.toString());
            res.write(data);
            return res.end('end');
        });

    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
})


invValidatorRouter.post('/getsigno', function(req, res) {
    let signature = req.body.signo.replace(/^data:image\/png;base64,/, "");

    fs.writeFile('static/templates/signo.png', signature, 'base64', function(err) {
        if (err) {
            console.log(err);
            return res.end('end');
        }
    });

    // Run python
    const { spawn } = require('child_process');
    const pyProg = spawn('python3', [process.cwd() + '/utils/add_signo.py', req.body.invoicePageNum, req.body.from]);

    pyProg.stdout.on('data', function(data) {

        console.log(data.toString());
        res.write(data);
        return res.end('end');
    });
    res.status(200).send('done');

})

invValidatorRouter.post('/copy', checkAuthenticated, function(req, res) {

    fs.copyFile(req.body.src, req.body.dest, (err) => {
        if (err) { throw err } else {
            console.log(`${req.body.src} was copied to ${req.body.dest}`);
            res.status(200).send('done');
        }
    });
})

invValidatorRouter.get('/uploads', checkAuthenticated, function(req, res) {
    let user = req.user;
    let msg = 'waiting for uploads...';
    res.render('upload', { user, msg })
});

invValidatorRouter.get('/download', function(req, res) {
    res.download(process.cwd() + '/static/templates/output2.pdf', 'myDocs.pdf');
})


let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './static/documents/to-validate/')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

let upload = multer({ storage: storage })


invValidatorRouter.post('/uploads/:user', checkAuthenticated, upload.array('invoice', 8), async(req, res) => {
    try {
        let user = req.params.user
        const invoices = req.files;
        // check if invoices are available
        if (!invoices) {
            res.status(400).send({
                status: false,
                data: 'No photo is selected.'
            });
        } else {
            let data = [];
            invoices.map(p => data.push({
                name: p.originalname,
                mimetype: p.mimetype,
                size: p.size
            }));

            let doc;
            data.forEach(async d => {
                try {
                    doc = new Document({
                        document_user: user,
                        file_name: d.name,
                        orig_file_name: d.name,
                        validated: false,
                        itemsArr: [{ item_descr: "", item_gross: 0, item_net: 0, item_gty: 0, item_vat: 0 }]
                    });

                    await doc.save()
                    res.redirect("/dashboard")

                } catch (error) {
                    res.render('error/500')
                    console.log(error);
                }
            })


        }

    } catch (err) {
        res.status(500).send(err.message);
        res.render('error/500')
    }
});

module.exports = invValidatorRouter;