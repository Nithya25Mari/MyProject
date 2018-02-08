



const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../model/User');
const _ = require('lodash');

const request = require('request');
var handlebars = require('handlebars');
var fs = require('fs');
const LocalStrategy = require('passport-local').Strategy;

var ErrorConfig = fs.readFileSync(__dirname + '/../Config/ErrorConfig.json');
var Domainconfig = fs.readFileSync(__dirname + '/../Config/CEConfig.json');
var GetProjectNameconfig = fs.readFileSync(__dirname + '/../Config/EntrpConfiguration.json');
var GetSubjectNameconfig = fs.readFileSync(__dirname + '/../Config/EmailSubjects.json');

var ErrorMsgs = JSON.parse(ErrorConfig);

var HCConfigDetails = JSON.parse(Domainconfig);

var  GetProjectNamefromEnterpriseconfig= JSON.parse(GetProjectNameconfig);

var SubjectConfigDetails = JSON.parse(GetSubjectNameconfig);





exports.postSignup = (req, res, next) => {    
    debugger;
    req.assert('Email', 'Email is not valid').isEmail();
    req.assert('Password', 'Password must be at least 4 characters long').len(4);
    req.assert('ConfirmPassword', 'Passwords do not match').equals(req.body.Password);
    req.sanitize('Email').normalizeEmail({ remove_dots: false });
    

    const errors = req.validationErrors();
console.log(errors);
    if (errors) {
        var Errordata = [];
        var data = {};
        data.ErrorMsg = ErrorMsgs.Register.HCR006;
        data.ErrorCode = 'HCR006';
        Errordata.push(data);

        return res.json(data);

    }

    const user = new User({
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        UserName: req.body.UserName,
        Password: req.body.Password,
        PhoneNumber: req.body.PhoneNumber
    });
console.log(user);
    var SplitEmail = req.body.Email.substr(req.body.Email.indexOf('@') + 1, req.body.Email.Length);
    var MailDomainLen = Object.keys(HCConfigDetails.Mail.Domains).length;
    var domaincheck = false;
    var DomainCheckFunction = function () {
        for (i = 0; i < MailDomainLen; i++) {


            if (SplitEmail == HCConfigDetails.Mail.Domains[i]) {
                domaincheck = true;
                break;
            }
            else if (SplitEmail != HCConfigDetails.Mail.Domains[i] && i == MailDomainLen - 1) {
                domaincheck = false;
                var Errordata = [];
                var data = {};
                data.ErrorMsg = ErrorMsgs.Register.HCR004;
                data.ErrorCode = 'HCR004';
                Errordata.push(data);
                res.json(data);

            }
        }
    };
    DomainCheckFunction();
    if (domaincheck) {
        domaincheck = false;
        User.findOne({ $or: [{ Email: req.body.Email }, { 'UserName': req.body.UserName },{ PhoneNumber: req.body.PhoneNumber}] }, (err, existingUser) => {

            if (err) { return next(err); }
            if (existingUser) {
                if (existingUser.Email == req.body.Email && existingUser.UserName == req.body.UserName) {
                    
                    var Errordata = [];
                    var data = {};
                    data.ErrorMsg = ErrorMsgs.Register.HCR001;
                    data.ErrorCode = 'HCR001';
                    Errordata.push(data);
                    res.json(data);

                }
                else if (existingUser.Email == req.body.Email && existingUser.UserName != req.body.UserName) {
                    var Errordata = [];
                    var data = {};
                    data.ErrorMsg = ErrorMsgs.Register.HCR003;
                    data.ErrorCode = 'HCR003';
                    Errordata.push(data);
                    res.json(data);

                } else if (existingUser.Email != req.body.Email && existingUser.UserName == req.body.UserName) {

                    var Errordata = [];
                    var data = {};
                    data.ErrorMsg = ErrorMsgs.Register.HCR002;
                    data.ErrorCode = 'HCR002';
                    Errordata.push(data);
                    res.json(data);

                }
                else if (existingUser.PhoneNumber == req.body.PhoneNumber) 
                {

                    var Errordata = [];
                    var data = {};
                    data.ErrorMsg = ErrorMsgs.Register.HCR007;
                    data.ErrorCode = 'HCR007';
                    Errordata.push(data);
                    res.json(data);

                }

            }
            else {
                async.waterfall([
                    function createRandomToken(done) {
                        crypto.randomBytes(16, (err, buf) => {
                            const token = buf.toString('hex');
                            done(err, token);
                        });
                    },
                    function setRandomToken(token, done) {
                        user.EmailConfirmationToken = token;
                        user.save((err) => {
                            done(err, token, user);
                        });

                    },



                    function sendEmailConfirmation(token, user, done) {
                        var readHTMLFile = function (path, callback) {
                            fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
                                if (err) {
                                    throw err;
                                    callback(err);
                                }
                                else {
                                    callback(null, html);
                                }
                            });
                        };


                        var smtpConfig = {
                            host: process.env.Mail_host,
                            port: process.env.Mail_port,
                            auth: {
                                user: process.env.Mail_user,
                                pass: process.env.Mail_password
                            }

                        };
                        var transporter = nodemailer.createTransport(smtpConfig);

                        readHTMLFile(__dirname + '/../MailContents/registerconfirmationmail.html', function (err, html) {
                            var template = handlebars.compile(html);
                            var replacements = {
                                FirstName: user.FirstName,
                                LastName: user.LastName,
                                ProjectName: GetProjectNamefromEnterpriseconfig.EnterpriseConfiguration.ApplicationTitle,  
                                URL: `http://${req.headers.host}/EmailConfirmation/${token}`

                            };
                            var htmlToSend = template(replacements);
                            var mailOptions = {
                                to: user.Email,
                                 from: process.env.Sender_name+ ' <' + process.env.From_mail + '>',
                                subject:  SubjectConfigDetails.EmailSubjects.RegistrationMailSubject.replace('#ProjectName',GetProjectNamefromEnterpriseconfig.EnterpriseConfiguration.ApplicationTitle),
                              
                                html: htmlToSend
                            };                          
                            transporter.sendMail(mailOptions, (err) => {
                               
                                var Errordata = [];
                                var data = {};
                                data.ErrorMsg = ErrorMsgs.Register.HCR005;
                                data.ErrorCode = 'HCR005';
                                Errordata.push(data);
                                res.json(data);
                                done(err);
                            });
                        });
                    }
                ], (err) => {
                    if (err) { return next(err); }                   
                    res.json("Failed");
                });

            }
        });
    };
};


