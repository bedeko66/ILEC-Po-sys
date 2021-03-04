const fs = require('fs');
const express = require('express');
const purchaseOrderRouter = express.Router();
const { checkAuthenticated } = require('../../config/googleAuth');
const { getAllInvoices } = require('../../controllers/invoiceController')
const multer = require('multer');

const firebaseDb = require('../../config/firebase');
const firestore = firebaseDb.firestore();

purchaseOrderRouter.get('/purchase-orders', checkAuthenticated, async function(req, res) {
    let user = req.user;
    const invoices = await getAllInvoices();
    res.render('dashboard', { user, invoices })
});

purchaseOrderRouter.get('/po-creator', checkAuthenticated, async function(req, res) {
    let user = req.user;
    res.render('po-creator', { user });
});

purchaseOrderRouter.post('/add-purchase-order', checkAuthenticated, async function(req, res) {
    try {
        const data = req.body;
        await firestore.collection('purchase-orders').doc().set(data);
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);

    }
});

purchaseOrderRouter.get('/download-po', function(req, res) {
    res.download(process.cwd() + '/static/templates/output.pdf', 'my-purchase-order.pdf');
})

// purchaseOrderRouter.post('/generate-purchase-order', function(req, res) {
//     let purchaseOrder = JSON.stringify(req.body.purchaseOrder);
//     console.log(purchaseOrder);
//     const { spawn } = require('child_process');
//     const poPdfpy = spawn('python3', [process.cwd() + '/utils/po_to_pdf_merge.py', purchaseOrder]);

//     poPdfpy.stdout.on('data', function(data) {
//         console.log(data.toString());
//         res.write(data);
//         return res.end('end');
//     });

// })

// purchaseOrderRouter.post('/getsigno', function(req, res) {
//     let signature = req.body.signo.replace(/^data:image\/png;base64,/, "");

//     fs.writeFile('static/templates/signo.png', signature, 'base64', function(err) {
//         if (err) {
//             console.log(err);
//             return res.end('end');
//         }
//     });

//     // Run python
//     const { spawn } = require('child_process');
//     const pyProg = spawn('python3', [process.cwd() + '/utils/add_signo.py', req.body.invoicePageNum]);

//     pyProg.stdout.on('data', function(data) {

//         console.log(data.toString());
//         res.write(data);
//         return res.end('end');
//     });
//     res.status(200).send('done');

//     // res.redirect("/invoice-validator")

// })

// purchaseOrderRouter.post('/copy', checkAuthenticated, function(req, res) {

//     fs.copyFile(req.body.src, req.body.dest, (err) => {
//         if (err) { throw err } else {
//             console.log(`${req.body.src} was copied to ${req.body.dest}`);
//             res.status(200).send('done');
//         }
//     });
// })

// purchaseOrderRouter.get('/uploads', checkAuthenticated, function(req, res) {
//     let user = req.user;
//     let msg = 'waiting for uploads...';
//     res.render('upload', { user, msg })
// });

// purchaseOrderRouter.get('/download', function(req, res) {
//     res.download(process.cwd() + '/static/templates/output2.pdf', 'myDocs.pdf');
// })

// let storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, './static/to-validate/')
//     },
//     filename: function(req, file, cb) {
//         cb(null, file.originalname)
//     }
// })

// let upload = multer({ storage: storage })
// purchaseOrderRouter.post('/uploads', upload.array('invoice', 8), async(req, res) => {
//     try {
//         const invoices = req.files;
//         console.log(invoices);
//         // check if invoices are available
//         if (!invoices) {
//             res.status(400).send({
//                 status: false,
//                 data: 'No photo is selected.'
//             });
//         } else {
//             let data = [];

//             // iterate over all invoices
//             invoices.map(p => data.push({
//                 name: p.originalname,
//                 mimetype: p.mimetype,
//                 size: p.size
//             }));

//             // send response
//             try {
//                 data.forEach(async d => {
//                         let invoice = { file_name: d.name };
//                         console.log(invoice);
//                         await firestore.collection('invoices').doc().set(invoice);
//                     })
//                     // res.send('Record saved successfuly');
//             } catch (error) {
//                 res.status(400).send(error.message);
//             }
//             res.redirect("/dashboard")

//         }

//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });

module.exports = purchaseOrderRouter;