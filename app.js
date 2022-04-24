//jshint esversion:6

//All required packages
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const  session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose");
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var findOrCreate = require('mongoose-findorcreate')






const app = express();

//REMEMBER TO GIT IGNORE .env FILE

//Declare express static variable
app.use(express.static("public"));

//Declare EJS as the view engine
app.set("view engine", "ejs");

//Declare bodyparser
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false 
}));

//WE HAVE TO USE NOW PASSPORT
//INITILIZE PASSPORT

app.use(passport.initialize());
app.use(passport.session());

//Connect to mongo DB
mongoose.connect(process.env.DB_HOST);

//SCHEMAS
const userSchema = new mongoose.Schema( {
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


//MODELS
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {

    console.log(profile)
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



//Define all the routs.

//Google auth:
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/callback", 
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });


app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", function(req, res){
    
})

app.get("/secrets", function(req, res) {
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/register");
    }
})


app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    })

});









app.listen(3000, function(){
    console.log("Server started on port 3000.");
});






