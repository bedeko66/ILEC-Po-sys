const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express()

const bodyParser = require('body-parser');
// const multer = require('multer');

app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, "static")));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


app.post('/generate-purchase-order', function(req, res) {
    let purchaseOrder = JSON.stringify(req.body.purchaseOrder);
    const { spawn } = require('child_process');

    const poPdfpy = spawn('python3', ['/home/bedeko/dev/po-proj/utils/po_to_pdf_merge.py', purchaseOrder]);
    poPdfpy.stdout.on('data', function(data) {
        console.log(data.toString());
        res.write(data);
        res.end('end');
    });

})

app.post('/getsigno', function(req, res) {
    let signature = req.body.signo.replace(/^data:image\/png;base64,/, "");

    fs.writeFile('static/uploads/signo.png', signature, 'base64', function(err) {
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

    res.redirect("/")

})

// // SET STORAGE
// let storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, 'uploads')
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
const PORT = 3000;
app.listen(3000, () => console.log(`Server started on port ${PORT}`))