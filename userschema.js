const { default: mongoose } = require('mongoose');
const connect = require('./connect');
connect.then(() => {
    console.log("connection Successfully");
}).catch((e) => {
    console.log("Error - " + e);
});
const employeeschema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email:
    {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password:
    {
        type: String,
        required: true,
    },
    storename:
    {
        type: String,
        required: true,
    }
});
const model = mongoose.model('task2data', employeeschema);
module.exports = model;