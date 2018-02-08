

var express = require('express');
var session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const expressValidator = require('express-validator');
var app = express();
var multer = require('multer');
var request = require('request');


var App_PORT = 4200;
 var dbpath = "mongodb://mongo:27017/testdb";
var SESSION_SECRET = "sample";
var fs = require('fs')
dotenv.load({ path: '.env.Config' });
app.use(express.static(__dirname + "/public"));
app.set('views', __dirname + '\\public');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());


   mongoose.connect(dbpath, function(err) {
            if (err) {
                 console.log('MongoDB connection error: ' + err);
                // return reject(err);
                process.exit(1);
            }
        });

const userController = require('./public/controller/user');
const passportConfig= require('./public/config/passport');

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
        url: dbpath,
        autoReconnect: true
    })
}));

app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true, parameterLimit: 200000 }));
app.use(expressValidator());
app.use(passport.initialize());
app.use(passport.session());



app.post('/login', userController.postLogin);
app.post('/signup', userController.postSignup);



app.set('port', App_PORT || 3000);
app.listen(app.get('port'), () => {
    console.log('%s server running on port', chalk.green('✓'), app.get('port'));
    console.log('  Press CTRL-C to stop\n');
});
