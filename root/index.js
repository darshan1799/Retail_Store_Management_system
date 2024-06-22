require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const model2 = require('../loginschema');
const e = require('express');
const stockmodel = require('../stockschema');
const stockschema = require('../stockschema');

const app = express();
const port = process.env.PORT || 2000;
try{
//---------------------------------Middelwares------------------------------------------
//dot env file is must only plaintext no need to semicolun or commas only assign key = value
function verifytoken(req, res, next) {
    token = req.cookies.token;
    jwt.verify(token, process.env.KEY, (err, data) => {
        if (err) {
            const login = "Session Expires ! Please Login Again😊"
            res.render('data', { login });
        }
        else {
            req.username = data.username;
            next();
        }
    });
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
//--------------------------------------------------------------------------

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render("home");
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/signup', (req, res) => {
    res.render('signup');
});
app.get('/editdata', (req, res) => {
    res.render('edit');
});


//-------------Sign Up Part----------------------------------------------------------
app.post('/signupdata', async (req, res) => {
    const model = require('../userschema');
    // console.log(req.body.email);
    const existemail = await model.find({ email: req.body.email });
    const existusername = await model.find({ username: req.body.username });
    if (existemail.toString() != [].toString()) {
        res.send("<h1>Email Already Exist</h1><br><a href='/signup'>Back To Sign Up</a>");
    }
    else if (existusername.toString() != [].toString()) {
        res.send("<h1>Username Already Exist</h1><br><a href='/signup'>Back To Sign Up</a>");
    }
    else {
        console.log(process.env.SALT);
        let hasspassword = await bcrypt.hash(req.body.password, parseInt(process.env.SALT));
        let data = new model({ name: req.body.name, email: req.body.email, username: req.body.username, password: hasspassword ,storename:req.body.storename});
        data = await data.save();
        // console.log(data);
        res.redirect('/login');
    }
});

//-------------Login Part----------------------------------------------------------

app.post('/logindata', async (req, res) => {
    const model = require('../userschema');
    const existemail = await model.find({ email: req.body.username });
    const existusername = await model.find({ username: req.body.username });
    if (existemail.toString() != [].toString() || existusername.toString() != [].toString()) {
        let finduser;
        let hasspassword;
        if (existemail.toString() != [].toString()) {
            finduser = existemail[0].email;
            hasspassword = existemail[0].password;
        }
        else {
            finduser = existusername[0].username;
            hasspassword = existusername[0].password;
        }
        const check = await bcrypt.compare(req.body.password, hasspassword);
        if (check) {
            console.log(process.env.KEY)
            let token = jwt.sign(req.body, process.env.KEY);

            //important part
            res.cookie("token", token, { httpOnly: true, maxAge: 900000 });

            const login = "Login SuccessFully";
            res.render('data', { login });
        }
        else {
            const login = "Please Check Your Password";
            res.render('data', { login });
        }
    }
    else {

        const login = "Incorrect Username Or Email";
        res.render('data', { login });
    }

});
//--------------------------------------------------------------------------------
app.get('/addtask', verifytoken, async (req, res) => {
    const model = require('../userschema');
    let username = await model.find({ email: req.username });
    let username2 = await model.find({ username: req.username });
    let name = "";
    if (username.toString() != [].toString()) {
        name = username[0].name;
        username = username[0].username;
    }
    else if(username2.toString() != [].toString()) {
        name = username2[0].name;
        username = username2[0].username;
    }
    let customerid = await model2.find({ username: username });
    let uniqid;
    if (customerid.toString() != [].toString()) {
        uniqid = customerid[0].productdetail.length;
    }
    else {
        uniqid = 0;
    }

  

    //stock and product name part
    let data = await stockmodel.find({username:username});
    let itemarray =[{itemname:"Insufficient Item Stock" }];
    if(data.toString() != [].toString())
        {
             itemarray  = data[0].stockarray;
    //   console.log(itemarray);
        }


     //stock check hai ki nai
     
    const idname =
    {
        id: uniqid + 1,
        name: name,
        itemarray : itemarray

    }
    res.render("addtask", { idname });

});




//-------------Tasklist Part----------------------------------------------------------


app.post('/taskpagedata', verifytoken, async (req, res) => {
    console.log(req.username);
    const model = require('../userschema');
    let username = await model.find({ email: req.username });
    let username2 = await model.find({ username: req.username });
    if (username.toString() != [].toString()) {
        username = username[0].username;
    }
    else {
        username = username2[0].username;
    }
    let existusername = await model2.find({ username: username });
    //update in stock
    let stockmodeluser = await stockmodel.find({username:username});
    if(stockmodeluser.toString() != [].toString())
        {
        let k = (stockmodeluser[0].stockarray.find((el)=>el.itemname == req.body.productname));
        // console.log(k);
        let stocks =parseInt(k.quantity);
        let finalstocks = stocks - parseInt(req.body.quantity);
        k.quantity = finalstocks;
        let index = stockmodeluser[0].stockarray.indexOf(k);
        // console.log(index);
        stockmodeluser[0].stockarray.splice(index,1,k);
        // console.log(stockmodeluser[0].stockarray);
        let finalstockarray =  stockmodeluser[0].stockarray;
       

        //sold stock and income counting
        let soldqauntity = parseInt(req.body.quantity);
        k.sold +=soldqauntity;
        k.income = (parseInt(k.sold) * parseInt(k.sellingprice)); 
        k.profit =parseInt(k.sold) *(parseInt(k.sellingprice) - parseInt(k.costprice));

        let updatestock = await stockmodel.updateOne({username:username},{$set:{stockarray:finalstockarray}});


        }

        //-------------------------------------------------------
    if (existusername.toString() != [].toString()) {

        let data = await model2.find({ username: username });
        let productarray = data[0].productdetail;
        let total = req.body.productprice * req.body.quantity;
        // console.log(total);
        req.body['total'] = total;
        productarray.push(req.body);
        let update = await model2.updateOne({ username: username }, { $set: { productdetail: productarray } });
        res.redirect('/addtask');
    }
    else {
        let total = req.body.productprice * req.body.quantity;
        // console.log(total);
        req.body['total'] = total;
        let insert = new model2({ username: username, productdetail: [req.body] });
        insert = await insert.save();
        // console.log(insert);
        res.redirect('/addtask');
    }

});

//-------------Tasklist View Part----------------------------------------------------------

app.get('/viewtask', verifytoken, async (req, res) => {
    const model = require('../userschema');
    let username = await model.find({ email: req.username });
    let username2 = await model.find({ username: req.username });
    let storename = "";
    if (username.toString() != [].toString()) {
        storename = username[0].storename;
        username = username[0].username;
    }
    else {
        storename = username2[0].storename;
        username = username2[0].username;
    }
    let data = await model2.find({ username: username });
    if (data.toString() == [].toString()) {
        data = [{ "errors": "No-Data Found!🔍" }];
    }
    else {
        data = data[0].productdetail;
    }
    const detail =
    {
        data: data,
        storename: storename
    }
    // console.log(storename);
    res.render('viewtask', { detail });
});

//-------------------------------Product Stock----------------------------------------------

app.get('/stocks',verifytoken,async (req,res)=>
{
    const model = require('../userschema');
    let username = await model.find({ email: req.username });
    let username2 = await model.find({ username: req.username });
    let storename = "";
    if (username.toString() != [].toString()) {
        username = username[0].username;
        storename = username[0].storename;
    }
    else if(username2.toString() != [].toString()){
        username = username2[0].username;
        storename = username2[0].storename;
    }
   
    let user = await stockmodel.find({username:username});
    let data = "";
    if(user.toString() != [].toString())
        {
     data = user[0].stockarray;
        }
        else
        {
            data = [{err:"No Product Found"}];
        }
    // console.log(data);
    res.render('stocks',{data,storename});

});
app.post('/stockdata',verifytoken,async(req,res)=>
{
    const model = require('../userschema');
    let username = await model.find({ email: req.username });
    let username2 = await model.find({ username: req.username });
    if (username.toString() != [].toString()) {
        username = username[0].username;
    }
    else {
        username = username2[0].username;
    }
   
    let user = await stockmodel.find({username:username});
    if(user.toString() != [].toString())
        {
            let arr =await stockmodel.find({
                $and:[{username:username},{"stockarray.itemname":req.body.itemname}]});
            if(arr.toString() != [].toString())
                {
                  let stockarray = arr[0].stockarray;
                  let k =  stockarray.find((el)=>el.itemname === req.body.itemname);
                  let index = stockarray.indexOf(k);
                  let quantity = parseInt(k.quantity);
                   stockarray.splice(index,1)
                //  console.log(stockarray);
                   k.sellingprice = req.body.sellingprice;
                   quantity += parseInt(req.body.quantity);
                   k.quantity = quantity;
                   k.costprice = req.body.costprice;
                   stockarray.splice(index,0,k);
                //    console.log(stockarray);
                 
                   let update =await stockmodel.updateOne({username:username},{$set:{stockarray:stockarray}});
                  res.redirect('/stocks');
                
                  
                }
            else
            {
                let detail =await stockmodel.find({username:username});
                 detail = detail[0].stockarray;
                k = req.body;
                k.sold = 0; 
                k.income =parseInt(k.sold) * parseInt(k.sellingprice);
                k.profit =parseInt(k.sold) *(parseInt(k.sellingprice) - parseInt(k.costprice));
                 detail.push(k);
                 
                  let update =await stockmodel.updateOne({username:username},{$set:{stockarray:detail}});
                  res.redirect('/stocks');

            }    
        }
        else
        {
            k = req.body;
            k.sold = 0;
            k.income =parseInt(k.sold) * parseInt(k.sellingprice);
            k.profit =parseInt(k.sold) *(parseInt(k.sellingprice) - parseInt(k.costprice));
            let insert = new stockmodel({username:username,stockarray:[k]});
            let save = await insert.save();
            // console.log(save);
            res.redirect('/stocks');
        }
   
});
}
catch(e)
{
    res.send("Server Temporary Down");
}

app.listen(port, () => {
    console.log(`Server started at localhost ${port}`);
})