const mongoose = require('mongoose');
let connect = mongoose.connect('mongodb://localhost:27017/task2');
module.exports = connect;