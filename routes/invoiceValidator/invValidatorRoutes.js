const fs = require('fs');
const express = require('express');
const invValidatorRouter = express.Router();
const { checkAuthenticated } = require('../../config/googleAuth');
const { getAllInvoices, getInvoice } = require('../../controllers/invoiceController')
const multer = require('multer');

const firebaseDb = require('../../config/firebase');
const firestore = firebaseDb.firestore();

invValidatorRouter.get('/dashboard', checkAuthenticated, async function(req, res) {
    let user = req.user;
    const invoices = await getAllInvoices();
    res.render('dashboard', { user, invoices })
});

invValidatorRouter.get('/invoice-validator/:id', checkAuthenticated, async function(req, res) {
    let user = req.user;
    let id = req.params.id;
    let invoice = await getInvoice(id)
    console.log(invoice);
    res.render('invoice-validator', { user, invoice, id });
});


invValidatorRouter.post('/generate-purchase-order', function(req, res) {
    let purchaseOrder = JSON.stringify(req.body.purchaseOrder);
    const { spawn } = require('child_process');

    const poPdfpy = spawn('python3', ['/home/bedeko/dev/po-proj/utils/po_to_pdf_merge.py', purchaseOrder]);

    poPdfpy.stdout.on('data', function(data) {
        console.log(data.toString());
        res.write(data);
        res.end('end');
    });

})

invValidatorRouter.post('/getsigno', function(req, res) {
    let signature = req.body.signo.replace(/^data:image\/png;base64,/, "");

    fs.writeFile('static/templates/signo.png', signature, 'base64', function(err) {
        if (err) {
            console.log(err);
        }
    });

    // Run python
    const { spawn } = require('child_process');
    const pyProg = spawn('python3', ['/home/bedeko/dev/po-proj/utils/add_signo.py', req.body.invoicePageNum]);

    pyProg.stdout.on('data', function(data) {

        console.log(data.toString());
        res.write(data);
        return res.end('end');
    });
    res.status(200).send('done');

    // res.redirect("/invoice-validator")

})

invValidatorRouter.post('/copy', checkAuthenticated, function(req, res) {

    fs.copyFile(req.body.src, req.body.dest, (err) => {
        if (err)
            throw err;
        console.log(`${req.body.src} was copied to ${req.body.dest}`);
    });
})

invValidatorRouter.get('/uploads', checkAuthenticated, function(req, res) {
    let user = req.user;
    let msg = 'waiting for uploads...';
    res.render('upload', { user, msg })
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
invValidatorRouter.post('/uploads', upload.array('invoice', 8), async(req, res) => {
    try {
        const invoices = req.files;
        console.log(invoices);
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
                        let invoice = { file_name: d.name };
                        console.log(invoice);
                        await firestore.collection('invoices').doc().set(invoice);
                    })
                    // res.send('Record saved successfuly');
            } catch (error) {
                res.status(400).send(error.message);
            }
            res.redirect("/dashboard")


            // res.send({
            //     status: true,
            //     message: 'invoices are uploaded.',
            //     data: data
            // });
        }

    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = invValidatorRouter;