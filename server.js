const path = require('path');
const morgan = require('morgan')
const express = require('express');
const passport = require('passport')
const compression = require('compression')
const cors = require('cors');
const session = require('express-session')
    // const Store = require('express-session').Store;
    // const MongooseStore = require('mongoose-express-session')(Store);
    // const MongoStore = require('connect-mongo')(express)
const mongoose = require('mongoose')
const connectDb = require('./config/mongoDb')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const appRouter = require('./routes/index');
const middlewares = require("./middlewares/middlewares");


require('dotenv').config();
connectDb()


app.use(compression());
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

//Passport conf
require('./config/passport')(passport)

// Session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: require('mongoose-session')(mongoose)
}))

//Passport middleware
app.use(passport.initialize())
app.use(passport.session())


app.use("/static", express.static(path.resolve(__dirname, 'static')));
app.set('view engine', 'ejs');

app.use('/', appRouter);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const port = process.env.PORT || 5000;

app.listen(port, () => { console.log(`Server started on port ${ port }`) })