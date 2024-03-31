require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const session = require('express-session');

//Requiring DB
const connectDB = require('./server/config/db');

const app = express();
const PORT = process.env.PORT || 5000;

//connect to DB by running function
// connectDB();


//Adding middleware
//To pass data through forms
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
    //cookie: {maxAge: new Date( Date.now() + (3600000))}
}))

app.use(express.static('public'));

//Templating engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');



app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

connectDB().then(()=>
    app.listen(PORT, ()=>{
    console.log(`App listening at ${PORT}`);
    })
)