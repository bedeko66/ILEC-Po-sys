const fs = require('fs');
const express = require('express');
const invValidatorRouter = express.Router();
const { checkAuthenticated } = require('../../config/googleAuth');
const { getAllInvoices, getInvoice, getAllPurchaseOrders, filterUnValidatedInvoices, filterAwaitingPurchaseOrders } = require('../../controllers/documentsController')
const multer = require('multer');

const firebaseDb = require('../../config/firebase');
const firestore = firebaseDb.firestore();


invValidatorRouter.get('/dashboard', checkAuthenticated, async function(req, res) {
    try {
        let user = req.user;
        const invoices = await getAllInvoices(user);
        if (Object.keys(invoices).length === 0) {
            const invoicesToValidate = {}
            res.render('dashboard', { user, invoicesToValidate })
        } else {
            const invoicesToValidate = filterUnValidatedInvoices(invoices)
            res.render('dashboard', { user, invoicesToValidate })

        }

    } catch (error) {
        console.log(error);
    }
});

invValidatorRouter.get('/validated-docs', checkAuthenticated, async function(req, res) {
    try {
        let user = req.user;
        const invoices = await getAllInvoices(user);
        res.render('validated-docs', { user, invoices })

    } catch (error) {
        console.log(error);
    }
});

invValidatorRouter.get('/invoice-validator/:id', checkAuthenticated, async function(req, res) {
    try {

        let user = req.user;
        let id = req.params.id;
        let invoice = await getInvoice(id)

        let purchase_orders = await getAllPurchaseOrders(user)
        let unmatchedPos = filterAwaitingPurchaseOrders(purchase_orders)

        res.render('invoice-validator', { user, invoice, id, unmatchedPos });
    } catch (error) {
        console.log(error);
    }
});

invValidatorRouter.get('/download-validated/:file_name', function(req, res) {
    res.download(process.cwd() + '/static/validated/' + req.params.file_name, req.params.file_name);
})



invValidatorRouter.post('/generate-purchase-order', function(req, res) {
    let purchaseOrder = JSON.stringify(req.body.purchaseOrder);


    const { spawn } = require('child_process');
    const poPdfpy = spawn('python3', [process.cwd() + '/utils/po_to_pdf_merge.py', purchaseOrder, req.body.from]);

    poPdfpy.stdout.on('data', function(data) {
        console.log(data.toString());
        res.write(data);
        return res.end('end');
    });

})

invValidatorRouter.get('/merge-from-existing-purchase-order', function(req, res) {

    const { spawn } = require('child_process');
    const poPdfpy = spawn('python3', [process.cwd() + '/utils/merge_from_existing_po.py']);

    poPdfpy.stdout.on('data', function(data) {
        console.log(data.toString());
        res.write(data);
        return res.end('end');
    });

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
        cb(null, './static/to-validate/')
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

            // iterate over all invoices
            invoices.map(p => data.push({
                name: p.originalname,
                mimetype: p.mimetype,
                size: p.size
            }));

            // send response
            try {
                data.forEach(async d => {
                        let invoice = {
                            document_user: user,
                            file_name: d.name,
                            orig_file_name: d.name,
                            validated: "no",
                            itemsArr: [{ item_descr: "", item_gross: "", item_net: "", item_gty: "", item_vat: "" }]
                        };

                        await firestore.collection('invoices').doc().set(invoice);
                    })
                    // res.send('Record saved successfuly');
            } catch (error) {
                res.status(400).send(error.message);
            }
            res.redirect("/dashboard")
        }

    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = invValidatorRouter;