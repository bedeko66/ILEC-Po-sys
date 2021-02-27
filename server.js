const compression = require('compression')
const path = require('path');
const cors = require('cors');
// const helmet = require("helmet");
const morgan = require('morgan')
const middlewares = require("./middlewares/middlewares");
const appRouter = require('./routes/index');
const express = require('express');
const app = express();

require('dotenv').config();


const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// app.use(helmet());
// app.use(helmet({
//     contentSecurityPolicy: false,
// }));
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));
app.use(cookieParser());
app.use(express.json());

app.set('view engine', 'ejs');

app.use('/', appRouter);


app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const port = process.env.PORT || 5000;

app.on('listening', function() {
    console.log('ok, server is running');
});

app.listen(port, () => { console.log(`Server started on port ${ port }`) })