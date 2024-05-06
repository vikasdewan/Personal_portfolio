if(process.env.NOD_ENV != "production"){
    require('dotenv').config()
}

const express = require("express");
const app = express();
const path = require("path");
const nodemailer = require("nodemailer");
const port =  process.env.PORT || 5500
const flash = require("connect-flash");
const session = require("express-session");
const bodyparser = require("body-parser");

app.set("port",port);
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'/public')));
app.set("views",path.join(__dirname,"/views"));
app.set("view engine",'ejs');
app.use(bodyparser.urlencoded({extended:true}));

const sessionOptions = {
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie:{
        expires :Date.now() + 7*24*60*60*1000,//date.now() show time in milisecond
        maxAge:7*24*60*60*1000,// 1 week
        httpOnly:true,
    },
};



app.use(session(sessionOptions));
app.use(flash());


app.use((req,res,next)=>{
    res.locals.success = req.flash("success") //success is a key here 
    res.locals.error = req.flash("error") ; 
    res.locals.currUser = req.user;
    // console.log(res.locals.success);
    next();
})




//Routing

app.get("/",(req,res)=>{
    res.render("index.ejs");
})

app.post("/send_email",(req,res)=>{
    let {name,email,subject,msg} = req.body;

    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'dewanganvikas192@gmail.com',
            pass: process.env.NODEMAILER_PASS,
        }
    });

  let mailOptions = {
    from :'dewanganvikas192@gmail.com',
    to : email,
    cc : 'dewanganvikas192@gmai.com',
    subject :"Thankyou for Giving feedback Message " + name,
    text : "Thankyou for your message that You have sent to us --> " + msg ,
  }

 transporter.sendMail(mailOptions,(err,info)=>{
     if(err){
        console.log(err)
     }
     else{
        console.log("email send: " + info.response)
     }
     req.flash("success","message Send Successfully");
     res.redirect("/")


 })

})

app.listen(port,()=>{
    console.log("app  is listening from port :" + port);
})