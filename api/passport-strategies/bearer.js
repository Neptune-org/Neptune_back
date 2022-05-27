const express = require("express");
const passport = require("passport");
const BearerStrategy = require("passport-http-bearer").Strategy;
const User = require("../models/Users");
const jwt = require("jsonwebtoken");

passport.use(
 
  new BearerStrategy(async (token, done) => {
      try{
    const tokenData =  jwt.verify(token,  process.env.SECRET);
   // console.log(tokenData);
    const user = await User.findById(  tokenData.userId );
    if (!user) {
     // console.log("no user");
      return done(null, false);
    } else {
     // console.log("yes user");
      return done(null, user);
    }
} catch (err) {
    console.log(err);
    return done(null, false); 
  }
  })
);
