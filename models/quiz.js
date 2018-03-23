var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var quiz = new Schema({
    title: {
        type: String,
        unique: true
    },
    creator: {
        name: String,
        id: String
    },
    ready: Boolean,
    countQuestions: Number,
    questions: [
        {
            question: String,
            qOptions: [String],
            correctOption: String
        }
    ],
    passed: [
        {
            location: String,
            counter: Number
        }
    ],
    failed: [
        {
            location: String,
            counter: Number
        }
    ],
    passedUsers: [
        {
            pUser: String,
            corrects: Number
        }
    ],
    failedUsers: [
        {
            pUser: String,
            corrects: Number
        }]
}, {
    timestamps: true
});


module.exports = mongoose.model('Quizd', quiz);