const { default: mongoose, Types } = require('mongoose');
const connect = require('./connect');
connect.then((data)=>
{
    console.log("Database Connected");
}).catch((err)=>
{
    console.log("Error On Connection");
});
const stockschema = mongoose.Schema({
    username:
    {
        type : String,
        required : true
    },
    stockarray:
    {
        type : Array,
        require:true
    }
});
module.exports = mongoose.model('stockdatas',stockschema);
