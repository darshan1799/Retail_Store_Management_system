const { default: mongoose, Types } = require('mongoose');
const connect = require('./connect');
connect.then(()=>
{
    console.log("Data Base Connected With Loginschema");
}).catch((e)=>
{
    console.log("Error -",e);
});
let loginschema =new mongoose.Schema({
    username:{
        type : String,
        required : true
    },
    productdetail:
    {
        type:Array,
        require:false,
        default:["no Data"]
    }
});
const model = mongoose.model('logindata',loginschema);
module.exports = model;
