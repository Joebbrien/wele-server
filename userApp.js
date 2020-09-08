const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const bodyParsar = require("body-parser");
const cor = require("cors");
const fs = require("fs");
const https = require("https");
const mongoDB = "mongodb://127.0.0.1:27017/wele_serverdb";
const userRoute = require("./src/routes/user");

//database connection and configuration
mongoose.connect(mongoDB, { useNewUrlParser: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
const app = express();
app.use(helmet());

const options = {
  origin: "*",
  optionsSuccessStatus: 200
};

//prepare and configure express route
app.use(helmet());
app.use(cor(options));
app.use(bodyParsar.urlencoded({ extended: true }));
app.use(bodyParsar.json());

app.use("/api/v1/user", userRoute);

https
  .createServer(
    {
      key: fs.readFileSync("./ssl/server.key"),
      cert: fs.readFileSync("./ssl/server.cert")
    },
    app
  )
  .listen(3000, function() {
    console.log(
      "Example app listening on port 3000! Go to https://localhost:3000/"
    );
  });

module.exports = app;
