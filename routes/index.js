var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var os = require('os');
var fs = require('fs-extra');
var Busboy = require('busboy');
var router = express.Router();
// var FS = require('fs');

var dbUrl = require("../config/configDB").url;
var Drive = require("../models/drive");
var LogModels = require("../models/logModels");
var Quiz = require("../models/quiz")

const PassingCriteria = 0.8;

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.user){
        var db = mongoose.connect(dbUrl);
        Quiz.find({'ready': true}, {'title': 1, 'countQuestions': 1, '_id': 1, 'passedUsers': {'$elemMatch': {'pUser': req.user._id}}, 'failedUsers': {'$elemMatch': {'pUser': req.user._id}}})/*.select('title countQuestions _id')*/.sort('-createdAt').exec(function (err, docs) {
            db.disconnect();
            res.render('index', { title: 'DLoud', quizzes: docs, pageUrl: 'home'});
        });
    } else {
        res.render('index', {title: 'DLoud'});
    }

});

router.get('/help', function (req, res) {
    res.render('help', {title: 'Help | DLoud'})
});


router.get('/updown', function (req, res) {
    res.render('temporary', {title: 'Upload Download'})
});

router.post('/updown', function (req, res) {
    res.json({"url": "http://localhost:3000/updown/download/file.jpg"});
});

router.get('/updown/download/:file', function (req, res) {
    // var img = FS.readFileSync(__dirname + '//../public/assets/images/cover.jpg');
    // res.download(img);

    // fs.readFile(__dirname + '//../public/assets/images/cover.jpg', "utf8", function(err, data){
    //     if(err) throw err;
    //
    //     res.download(data);
    // });
    res.download(__dirname + '//../public/assets/images/cover.jpg', 'myfile.jpg')
});

router.get('/portal', function (req, res) {
   res.render('portal', {title: 'Portal - DocSync'});
});

router.route('/quiz/answer/:quizId')
    .get(function (req, res) {
       if(req.params.quizId){
           var db = mongoose.connect(dbUrl);
           Quiz.findById(req.params.quizId, function (err, quiz) {
               db.disconnect();
               res.render('solveQuiz', {title: 'Solve | '+quiz.title, quiz: quiz});
           });
       }else{
           res.redirect('/');
       }
    })
    .post(function (req, res) {
        var db = mongoose.connect(dbUrl);
        Quiz.findById(req.params.quizId, function (err, quiz) {
            var correct = 0;
            for (var i=0; i<quiz.countQuestions; i++) {
                if (req.body['q-'+(i+1)] === quiz.questions[i].correctOption) {
                    correct++;
                }
            }
            console.log('Correct answers: '+correct);
            var score = correct/quiz.countQuestions;
            if(score >= PassingCriteria) {
                var pCounter = 1;
                for(var l=0; l<quiz.passed.length; l++) {
                    if(quiz.passed[l][location] === req.user.area){
                        pCounter = quiz.passed[l].counter
                    }
                }
                if (pCounter > 1){
                    Quiz.findByIdAndUpdate(req.params.quizId, {
                        '$set': {
                            'passed.$.counter': counter
                        }
                    }).exec(function () {
                       db.disconnect();
                       res.render('quizResult', {title: 'Result | '+quiz.title, qTitle: quiz.title, score: Math.round(score*100)});
                    });
                } else {
                    Quiz.findByIdAndUpdate(req.params.quizId, {
                        "$push": {
                            'passed': {'location': req.user.area, counter: pCounter},
                            'passedUsers':  {'pUser': req.user._id, 'corrects': correct}
                        }
                    }).exec(function () {
                        db.disconnect();
                        res.render('quizResult', {title: 'Result | '+quiz.title, qTitle: quiz.title, score: Math.round(score*100)});
                    });
                }
            } else {
                var pCounter = 1;
                for(var l=0; l<quiz.failed.length; l++) {
                    if(quiz.failed[l][location] === req.user.area){
                        pCounter = quiz.failed[l].counter
                    }
                }
                if (pCounter > 1){
                    Quiz.findByIdAndUpdate(req.params.quizId, {
                        '$set': {
                            'failed.$.counter': counter
                        }
                    }).exec(function () {
                        db.disconnect();
                        res.render('quizResult', {title: 'Result | '+quiz.title, qTitle: quiz.title, score: Math.round(score*100)});
                    });
                } else {
                    Quiz.findByIdAndUpdate(req.params.quizId, {
                        "$push": {
                            'failed': {'location': req.user.area, counter: pCounter},
                            'failedUsers': {'pUser': req.user._id, 'corrects': correct, qTitle: quiz.title, score: Math.round(score*100)}
                        }
                    }).exec(function () {
                        db.disconnect();
                        res.render('quizResult', {title: 'Result | ' + quiz.title});
                    });
                }
            }
        });
    });

router.route('/new-quiz')
    .get(function (req, res) {
        res.render('newQuiz', {title: 'Create Quiz'});
    })
    .post(function (req, res) {
        var newQuiz = new Quiz ({
            title: req.body.title,
            ready: false,
            countQuestions: 0,
            questions: [],
            creator: {
                name: req.user.local.username,
                id: req.user._id
            },
            passed: [],
            failed: [],
            passedUsers: [],
            failedUsers: []
        });
        var db = mongoose.connect(dbUrl);
        newQuiz.save(function (err) {
            db.disconnect();
            res.redirect('/hold-quizzes');
        });
    });

router.get('/hold-quizzes', function (req, res) {
    var db = mongoose.connect(dbUrl);
    Quiz.find({'ready': false}).select('title countQuestions createdAt _id').sort('-createdAt').exec(function(err, docs) {
        db.disconnect();
        res.render('holdQuizzes', {title: 'Hold Quizzes', quizzes: docs});
    });
});

router.get('/complete-quizzes', function (req, res) {
    var db = mongoose.connect(dbUrl);
    Quiz.find({'ready': true}).select('title countQuestions createdAt _id').sort('-createdAt').exec(function(err, docs) {
        db.disconnect();
        res.render('completeQuizzes', {title: 'Completed Quizzes', quizzes: docs});
    });
});

router.get('/hold-quiz/:qId', function (req, res) {
    res.render('holdQuiz', {title: 'Quiz | '+req.params.qId, qId: req.params.qId});
});

router.get('/complete-quiz/:qId', function (req, res) {
    res.render('completeQuiz', {title: 'Quiz | '+req.params.qId, qId: req.params.qId});
});

router.get('/quiz/complete/:quizId', function (req,res) {
    var db = mongoose.connect(dbUrl);
    console.log(req.params.quizId);
    Quiz.findByIdAndUpdate(req.params.quizId, {'ready': true}, function (err, quiz) {
        if(err) {
            console.log(err);
        }
        db.disconnect();
        res.redirect('/complete-quizzes');
    });
});

router.get('/quiz/stat/:quizId', function (req, res) {
    var db = mongoose.connect(dbUrl);
    Quiz.findById(req.params.quizId, function (err, quiz) {
        db.disconnect();
        res.render('quizStat', {title: 'Quiz stat | '+quiz.title, quiz: quiz});
    });
});

router.get('/dloud/stats/:filename?/:fileId?', function (req, res) {
    var db = mongoose.connect(dbUrl);
    LogModels.fileDownloadLog.aggregate([
        {
            "$group": {
                "_id": {
                    "year": {$year: "$updatedAt"}
                }
            }
        }
    ], function (err, yearsL) {
        db.disconnect();
        res.render('fileStat', {title: req.query.filename, fileId: req.query.fileId, logYears: yearsL});
    });
});

router.post('/uploadFile:parentFolder?', function (req, res, next) {
    var fstream;
    var busboy = new Busboy({ headers: req.headers });
    req.pipe(req.busboy);

    req.busboy.on('file', function (fieldname, file, filename) {
        fstream = fs.createWriteStream(__dirname+'/../public/upload/'+fieldname+path.extname(filename));
        file.pipe(fstream);
        fstream.on('close', function () {
            var db = mongoose.connect(dbUrl);
            var newFile = new Drive({
                name: fieldname,
                shortname: fieldname.toLowerCase(),
                fType: 'file',
                parent: req.query.parentFolder,
                childs: null,
                creator: req.user._id,
                data: {
                    content: fs.readFileSync(__dirname+'/../public/upload/'+fieldname+path.extname(filename)),
                    contentType: path.extname(filename)
                }
            });
            newFile.save(function (err, savedFile) {
                fs.unlink(__dirname+'/../public/upload/'+fieldname+path.extname(filename));
                if(err){
                    res.json({status: false});
                    db.disconnect();
                } else {
                    var newUpFile = new LogModels.fileUploadLog({
                        username: req.user.local.username,
                        userId: req.user._id,
                        fileId: savedFile._id,
                        filename: savedFile.name,
                        userIp: req._remoteAddress
                    });
                    newUpFile.save(function () {
                        db.disconnect();
                    });
                    res.json({status: true});
                }
            });
        });
    });
});

/*router.get("/ip", function (req, res) {
    res.json({IP: req.connection.remoteAddress, X_IP: req.headers['x-forwarded-for']});
});*/

module.exports = router;
