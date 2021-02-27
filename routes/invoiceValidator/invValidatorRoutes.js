const express = require('express');
const path = require('path');
const fs = require('fs')
    // const { checkAuthenticated } = require('../../middlewares/middlewares');
const invValidatorRouter = express.Router();
const { getAllInvoices } = require('../../controllers/invoiceController')


const client = require('../../config/googleAuth')
require('dotenv').config()

function checkAuthenticated(req, res, next) {
    let token = req.cookies['session-token'];

    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
    }
    verify()
        .then(() => {
            if (user.email === 'h5623cc@gmail.com') {
                req.user = user;
                next();
            } else {
                // res.send('Unauthorized email')
                // res.redirect('/')
                next();
            }
        })
        .catch(err => {
            res.redirect('/')
        })
}


invValidatorRouter.get('/dashboard', checkAuthenticated, async function(req, res) {
    let user = req.user;
    const invoices = await getAllInvoices();
    res.render('dashboard', { user, invoices })
});

invValidatorRouter.get('/invoice-validator', checkAuthenticated, function(req, res) {
    let user = req.user;
    res.render('invoice-validator', { user })
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
        res.end('end');
    });

    // res.redirect("/invoice-validator")

})

module.exports = invValidatorRouter;


// const multer = require('multer');

// // SET STORAGE
// let storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, 'templates')
//     },
//     filename: function(req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now())
//     }
// })

// let upload = multer({ storage: storage })

// app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
//     const file = req.file
//     if (!file) {
//         const error = new Error('Please upload a file')
//         error.httpStatusCode = 400
//         return next(error)
//     }
//     res.send(file)

// })