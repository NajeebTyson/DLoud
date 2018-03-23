var express = require('express');
var mongoose = require("mongoose");
var fs = require('fs-extra');
var ObjectId = mongoose.ObjectId;

var router = express.Router();

var dbUrl = require("../config/configDB").url;
var Drive = require("../models/drive");
var Users = require("../models/users");
var LogModels = require("../models/logModels");
var Quiz = require("../models/quiz");

router.get("/dloud/quiz/data/:qId?", function (req, res) {
    var db = mongoose.connect(dbUrl);
    Quiz.find({'_id': req.query.qId}, function (err, data) {
        db.disconnect();
        res.json(data);
    });
});

router.post("/dloud/quiz/add-question", function (req, res) {
    var question = req.body.question,
    qOptions = req.body.qOptions.split("&"),
    correctOption = req.body.cOption, quizId = req.body.quizId;
    var db = mongoose.connect(dbUrl);
    Quiz.findByIdAndUpdate(quizId, {
        "$push": { "questions": {
            question: question,
            qOptions: qOptions,
            correctOption: correctOption
            }
        },
        "$inc": { 'countQuestions': 1 }
    }, function(err){
        db.disconnect();
        res.json({status: "OK"});
    });
});

router.get("/dloud/drive/files/:parentFolder?", function (req, res) {
    if(req.query.parentFolder === 'undefined')
        return;
    var db;
    db = mongoose.connect(dbUrl);
    Drive.find({'parent': req.query.parentFolder}).select('_id name fType createdAt updatedAt data.contentType').exec(function (err, files) {
       res.json({
           files: files
       }) ;
        db.disconnect();
    });
    db.disconnect();
});


router.get("/dloud/drive/openFile/:filename?", function (req, res) {
   var db = mongoose.connect(dbUrl);
    Drive.findOne({'shortname': req.query.filename.toLowerCase()}, function (err, file) {
        if(file) {
            res.json(file);
            db.disconnect();
        }
        db.disconnect();
    });
});

router.get("/dloud/drive/make_folder/:newFolder?/:parentFolder?", function (req, res) {
    var db = mongoose.connect(dbUrl);
    Drive.findOne({'shortname': req.query.newFolder.toLowerCase()}, function (err, folder) {
        if(folder) {
            res.json({
                status: 'already'
            });
            db.disconnect();
        }else if(err) {
            res.json({
                status: 'error'
            });
            db.disconnect();
        }else {
            var newDrive = new Drive({
                name: req.query.newFolder,
                shortname: req.query.newFolder.toLowerCase(),
                fType: 'folder',
                parent: req.query.parentFolder,
                childs: null,
                creator: req.user._id,
                data: {
                    content: null,
                    contentType: null
                }
            });

            newDrive.save(function (err, drive) {
                if(err) {
                    res.json({
                        status: 'errorSave'
                    });
                    db.disconnect();
                } else {
                    res.json({
                        status: 'done'
                    });
                    var newFolder = new LogModels.createFolderLog({
                        username: req.user.local.username,
                        userId: req.user._id,
                        folderId: drive._id,
                        folderName: drive.name,
                        userIp: req._remoteAddress
                    });
                    newFolder.save(function () {
                        db.disconnect();
                    })
                }
            });
        }
    });
});

router.post("/dloud/drive/download-request", function (req, res) {
    var db = mongoose.connect(dbUrl);
    Users.findOne({'local.username': req.body.username, '_id': req.body._id}, function (err, thisUser) {
        if(thisUser){
            console.log(thisUser);
            var dFile = new LogModels.fileDownloadLog({
                username: thisUser.local.username,
                userId: thisUser._id,
                location: thisUser.area,
                fileId: req.body.fileId,
                filename: req.body.filename,
                userIp: req._remoteAddress
            });
            console.log(dFile);
            //var db = mongoose.connect(dbUrl);
            dFile.save(function () {
                res.json({status: 'OK'});
                db.disconnect();
            });
        }
        db.disconnect();
    });
});

router.get("/dloud/drive/download-file/:filename?/:fileId?", function (req, res) {
    var db = mongoose.connect(dbUrl);
    Drive.findOne({'name': req.query.filename.toString(), _id: req.query.fileId}).select('data.content name data.contentType _id').exec(function (err, file) {
        if(file){
            var myfile = __dirname+'/../public/download/'+file.name+file.data.contentType;
            fs.writeFileSync(myfile, file.data.content);
            res.download(myfile, function () {
                /*setTimeout(function () {
                    fs.unlink(myfile);
                },20000);*/
                if(req.user){
                    var dFile = new LogModels.fileDownloadLog({
                        username: req.user.local.username,
                        userId: req.user._id,
                        location: req.user.area,
                        fileId: file._id,
                        filename: file.name,
                        userIp: req._remoteAddress
                    });
                    var db = mongoose.connect(dbUrl);
                    dFile.save(function () {
                        db.disconnect();
                    });
                }
            });
        }
        db.disconnect();
    });
});

router.get("/dloud/drive/delete-file/:filename?/:fileId?", function (req, res) {
    var db = mongoose.connect(dbUrl);
    Drive.findOneAndRemove({'name': req.query.filename.toString(), _id: req.query.fileId}, function (err) {
        if(err){
            res.json({status: 'failed'});
            db.disconnect();
        } else {
            var dFile = new LogModels.fileDeleteLog({
                username: req.user.local.username,
                userId: req.user._id,
                fileId: req.query.fileId,
                filename: req.query.filename,
                userIp: req._remoteAddress
            });
            dFile.save(function () {
                db.disconnect();
            });
            res.json({status: 'removed'});
        }
    });
});

router.get("/dloud/drive/members/:projectName?", function (req, res) {
    var db = mongoose.createConnection(dbUrl);
    Users.find({'projects.name': req.query.projectName.toString()}).select('local.name _id').exec(function (err, users) {
        // console.log(users);
        mongoose.connection.close();
        if(err){
            res.json({status: 'failed'});
        } else {
            res.json(users);
        }
    });
    mongoose.connection.close();
});

router.get("/dloud/drive/all-users/:projectName?", function (req, res) {
    var db = mongoose.createConnection(dbUrl);
    Users.find({'projects.name': {'$ne': req.query.projectName.toString()}}).select('local.name _id').exec(function (err, users) {
        mongoose.connection.close();
        // console.log(users);
        if(err) {
            res.json({status: 'failed'});
        }
        res.json(users);
    });
    mongoose.connection.close();
});

router.get("/dloud/drive/add-member/:projectName?/:user?", function (req, res) {
    var db = mongoose.createConnection(dbUrl);
    Users.findByIdAndUpdate(req.query.user.toString(), { "$push": { "projects": {name: req.query.projectName.toString(), admin: false} }}, function(err){
        var addMember = new LogModels.removeMemberLog({
            username: req.user.local.username,
            userId: req.user._id,
            userIp: req._remoteAddress,
            // addedMemberId: String,
            addedMemberId: req.query.user,
            projectName: req.query.projectName
        });
        addMember.save(function () {
            mongoose.connection.close();
        });
        res.json({status: true});
        // db.disconnect();
    });
});

router.get("/dloud/drive/remove-member/:projectName?/:user?", function (req, res) {
    var db = mongoose.createConnection(dbUrl);
    Users.findByIdAndUpdate(req.query.user.toString(), { "$pull": { "projects": {name: req.query.projectName.toString(), admin: false} }}, function(err){
        var remMember = new LogModels.removeMemberLog({
            username: req.user.local.username,
            userId: req.user._id,
            userIp: req._remoteAddress,
            // removedMemberId: String,
            removedMemberId: req.query.user,
            projectName: req.query.projectName
        });
        remMember.save(function () {
            mongoose.connection.close();
        });
        res.json({status: true});
    });
});


module.exports = router;