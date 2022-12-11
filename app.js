const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");


require("dotenv").config();

const app = express();

app.use(express.static("public")); //Allows the server to take in the static pages (CSS, Bootstrap)
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res){
    res.sendFile(__dirname + "/signup.html");
});

app.post("/", function(req, res){
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.email;

    const data = { //Data that is being collected for each subscriber.
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    };

    const CAPI_KEY = process.env.API_KEY;
    const CLIST_ID = process.env.LIST_ID;
    
    const jsonData = JSON.stringify(data); //Shrinks the "data" into one line to send to MailChimp API.
    const url = "https://us10.api.mailchimp.com/3.0/lists/" + CLIST_ID; //Digits after "us" must match with the "auth"
    const options = {
        method: "POST", 
        auth: "mailChimp:" + CAPI_KEY //Digits after "us" must match with url, and the last digit(s) at the end of the api key.
    }

    const request = https.request(url, options, function(response){ //url takes in the MailChimp API endpoint, options
        if(response.statusCode === 200) {
            res.sendFile(__dirname + "/success.html");
        } else {
            res.sendFile(__dirname + "/failure.html");
        }

            response.on("data", function(data){
                console.log(JSON.parse(data));
            });
    });

    request.write(jsonData);
    request.end();
});

app.post("/failure", function(req, res){
    res.redirect("/");
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Server is running on port 3000");
});

