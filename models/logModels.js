var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var deleteLog = new Schema({
    username: String,
    userId: String,
    fileId: String,
    filename: String,
    userIp: String
}, {
    timestamps: true
});

var addMemberLog = new Schema({
    username: String,
    userId: String,
    userIp: String,
    addedMemberId: String,
    // addedMemberName: String,
    projectName: String
}, {
    timestamps: true
});

var removeMemberLog = new Schema({
    username: String,
    userId: String,
    userIp: String,
    removedMemberId: String,
    // removedMemberName: String,
    projectName: String
}, {
    timestamps: true
});

var createFolderLog = new Schema({
    username: String,
    userId: String,
    folderId: String,
    folderName: String,
    userIp: String
}, {
    timestamps: true
});

var fileDownloadLog = new Schema({
    username: String,
    userId: String,
    fileId: String,
    filename: String,
    location: String,
    userIp: String
}, {
    timestamps: true
});

var fileUploadLog = new Schema({
    username: String,
    userId: String,
    fileId: String,
    filename: String,
    userIp: String
}, {
    timestamps: true
});

var userLoginLog = new Schema({
    userEmail: String,
    userIp: String,
    device: String,
    access: Boolean
}, {
    timestamps: true
});

module.exports = {
    createFolderLog: mongoose.model('createFolderLog', createFolderLog),
    fileDeleteLog: mongoose.model('fileDeleteLog', deleteLog),
    addMemberLog: mongoose.model('addMemberLog', addMemberLog),
    removeMemberLog: mongoose.model('removeMemberLog', removeMemberLog),
    fileDownloadLog: mongoose.model('fileDownloadLog', fileDownloadLog),
    fileUploadLog: mongoose.model('fileUploadLog', fileUploadLog),
    userLoginLog: mongoose.model('userLoginLog', userLoginLog)
};