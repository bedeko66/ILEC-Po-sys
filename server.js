const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();

//Google Auth
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '431439752621-h7mu26f26imvlsos5bf4repdq8hbekem.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// const multer = require('multer');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "static")));
app.use(express.json());
app.use(cookieParser());


// app.get('/login', function(req, res) {
//     res.sendFile(__dirname + '/static/invoiceValidator.html');
// })

app.get('/', function(req, res) {
    res.clearCookie('session-token');
    res.redirect('/login')
});

app.get('/login', function(req, res) {
    // res.sendFile(__dirname + '/index.html');
    res.render('index.ejs')
});

app.post('/login', function(req, res) {
    let token = req.body.token;
    console.log(token);

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        console.log(payload);
    }
    verify()
        .then((() => {
            res.cookie('session-token', token);
            res.send('success');
        })).catch(console.error);
})


app.get('/logout', function(req, res) {
    res.clearCookie('session-token');
    res.redirect('/login')
});

app.get('/invoice-validator', checkAuthenticated, function(req, res) {
    let user = req.user;
    res.render('invoice-validator', { user })
        // res.sendFile(__dirname + '/static/invoiceValidator.html');
});

app.get('/dashboard', checkAuthenticated, function(req, res) {
    let user = req.user;
    res.render('dashboard', { user })
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

    res.redirect("/invoice-validator")

})

function checkAuthenticated(req, res, next) {
    let token = req.cookies['session-token'];

    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
    }
    verify()
        .then(() => {
            req.user = user;
            next();
        })
        .catch(err => {
            res.redirect('/')
        })
}

const PORT = 3000;
app.listen(3000, () => console.log(`Server started on port ${PORT}`))


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