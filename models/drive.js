var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var drive = new Schema({
    name: String,
    shortname: String,
    fType: String,
    parent: String,
    childs: [String],
    creator: String,
    data: {
        content: Buffer,
        contentType: String
    },
    restricted: [String]

}, {
    timestamps: true
});

module.exports = mongoose.model('Drive', drive);