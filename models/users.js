var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var user = new Schema({
    local : {
        name: {
            first: String,
            last: String
        },
        username: {
            type: String,
            unique: true
        },
        email:  {
            type: String,
            unique: true
        },
        password: String,
        userType: String
    },
    area: String,
    projects: [
        {
            name: String,
            admin: Boolean
        }
    ]

});


module.exports = mongoose.model('User', user);