const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const pdf = require('pdf-parse');
var mongoose = require("mongoose");
const bodyParser = require('body-parser');

//call the cron

//strategies
require('./api/passport-strategies/bearer')
//import routes
var indexRouter = require("./api/routes/index");
var usersRouter = require("./api/routes/users");
var authRouter = require("./api/routes/authetification.route");
var graveyardRouter = require("./api/routes/graveyard.route");
var profileRouter = require("./api/routes/profile.route");
var mailRouter = require("./api/routes/mailApi.route");



// .env config
require("dotenv").config();



// import connect
const app = express();
const port= process.env.PORT || 3000;
app.set("views", path.join(__dirname, "./api/views"));
app.set("view engine", "ejs");
mongoose
  .connect(process.env.DATABASE, {
    useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false})
  .then(() => console.log("Connected to Mongo"))
  .catch((err) => console.log(err));
  

app.use(express.static(path.join(__dirname, './api/public')));
app.use("/uploads",express.static(path.join(__dirname, "./api/uploads")));
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(morgan("dev"));
app.use("/", indexRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/graveyard", graveyardRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/mail", mailRouter);


app.listen(port, ()=>{
    console.log("server is listening on ", port);
} )



