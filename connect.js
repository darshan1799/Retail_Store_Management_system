const mongoose = require('mongoose');
let connect = mongoose.connect("mongodb://localhost:27017/task2");
// let connect = mongoose.connect('mongodb+srv://darshan:darshan123@cluster0.3zzlor5.mongodb.net/mydata');
module.exports = connect;