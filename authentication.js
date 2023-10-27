const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    // res.send("Hi! This is Rahat Khan's first server!");
    res.sendFile(__dirname + "/login.html");
});

app.post("/", function (req, res) {
    //console.log("Hello"); // Move this line inside the POST route
    //console.log(req.body);
    var id="Admin";
    var password="123456";
    var inputid=req.body.username;
    var inputpass=req.body.password;

    if (inputid === id && inputpass === password) {
        res.send("Welcome to furniture lagbe");
    } else {
        res.send("Invalid ID or password");
    }
});

app.listen(3000, function () {
    console.log("Hi! This is Rahat Khan's first server!");
});