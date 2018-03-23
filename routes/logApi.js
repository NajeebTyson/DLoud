var express = require('express');
var mongoose = require("mongoose");

var router = express.Router();

var dbUrl = require("../config/configDB").url;
var LogModels = require("../models/logModels");

router.get("/dloud/drive/stats-file/:filename?/:fileId?/:year?", function (req, res) {
    var lyear = parseInt(req.query.year);
    var db = mongoose.connect(dbUrl);

    LogModels.fileDownloadLog.aggregate([
        { "$match": {'filename': req.query.filename, 'fileId': req.query.fileId, 'updatedAt': {"$gte": new Date(lyear, 0, 1), "$lt": new Date(lyear+1, 0, 1)}}},
        { "$group": {
            "_id": {
                "location": "$location",
                "month": { $month: "$updatedAt"}
            },
            "logCount": { "$sum": 1 }
        }},
        { "$group": {
            "_id": "$_id.location",
            "logs": {
                "$push": {
                    "month": "$_id.month",
                    "count": "$logCount"
                },
            },
            "count": { "$sum": "$logCount" }
        }}
    ], function (err, downLogs) {
        if(err){
            res.json({status: 'ERROR'});
        } else {
            res.json(downLogs);

        }
        db.disconnect();
    });

});

module.exports = router;