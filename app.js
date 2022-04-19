//jshint esversion:6

//All required packages
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
require('dotenv').config();

const app = express();

//REMEMBER TO GIT IGNORE .env FILE

//Declare express static variable
app.use(express.static("public"));

//Declare EJS as the view engine
app.set("view engine", "ejs");

//Declare bodyparser
app.use(bodyParser.urlencoded({extended:true}));

//Connect to mongo DB
mongoose.connect(process.env.DB_HOST);

//SCHEMAS
const userSchema = new mongoose.Schema( {
    email: String,
    password: String
})

//SECRET KEY
//ENCRYPT PASSWORD FIELD
userSchema.plugin(encrypt, {secret:process.env.SECRET_KEY, encryptedFields:['password']});

//MODELS
const User = new mongoose.model("User", userSchema);


//Define all the records.
app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", function(req, res){
    // recuperamos EMAIL / PASSWORD
    const username = req.body.username;
    const password = req.body.password;


    User.findOne({email:username}, function(err, foundUser){
        if (!err) {
            if(foundUser){
                if (foundUser.password === password) {
                    res.render("secrets");
                }
            }
        } 
        else {
            console.log(err);
        }
    });
})


app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    
    //QUE OBTENEMOS DEL FORMULARIO:
    // username / password
  
    //CREATE NEW USER:
    const newUser= new User({
        email: req.body.username,
        password: req.body.password
    })

    newUser.save(function(err){
        if(!err){
            res.render("secrets")
        }else{
            console.log(err);
        }
    })
});









app.listen(3000, function(){
    console.log("Server started on port 3000.");
});






