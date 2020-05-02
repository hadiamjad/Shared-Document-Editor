const express = require('express')
const fs = require('fs');
const bodyParser = require('body-parser')
var getDocs = require('./DocsEngine.js');

var homepage = new getDocs.Homepage();

var CurrentUser = null

const sql = require("mssql")
const dbConfig = {
    server: "DESKTOP-DL240JO",
    database: "Docs",
    user: "hadi",
    password: "123"
}
var app = express()
var urlencodedParser = bodyParser.urlencoded({ extended: false })


// Login landing page is loded
app.get(["/","/Login"],function (request,response) {	  
	filePath = "Login.html"

	fs.readFile(filePath,function(err,contents){		
		response.send(contents.toString())
	})
})

// Register landing page is loded
app.get(["/Register"],function (request,response) {	  
	filePath = "Register.html"

	fs.readFile(filePath,function(err,contents){		
		response.send(contents.toString())
	})
})

// Document list landing page is loded
app.get(["/Docs"],function (request,response) {	  
    homepage.loadDocuments(CurrentUser,function(docs){

        //console.log(docs[0].generateHtmlforHomepage())
        var html = ""

        for(i=0; i< docs.length;i++){
            html+=docs[i].generateHtmlforHomepage();
        }

        
        filePath = "Docx.html"

        fs.readFile(filePath,function(err,contents){		
            response.send(contents.toString().replace("<!-- content -->",html));
        });
    });
})

//login form request handler
app.post('/login', urlencodedParser, function (req, resp) {
    var con1 = new sql.ConnectionPool(dbConfig)
    var req1 = new sql.Request(con1)

    var flag = 0; // 1 for error 0 for !error

    con1.connect(function(err){
        if(err){
            console.log(err)
            return
        }
        req1.query("EXEC LoginReq @pp = \""+req.body.Password+"\", @e = \""+req.body.Email+"\"", function(err,res){
            if(err){
                console.log('Login check SQL Error')
                error = 1
            }
            else{
                if(res.rowsAffected[0] == 0){
                    console.log('Account doesnt exist or wrong password.')
                    error = 1
                }
                else{
                    CurrentUser = req.body.Email
                    resp.redirect('/Docs')
                }
            }
        con1.close()
        })
    })
})

//register form request handler
app.post('/register', urlencodedParser, function (req, resp) {
    var con1 = new sql.ConnectionPool(dbConfig)
    var req1 = new sql.Request(con1)
    console.log(req.body)
    var flag = 0; // 1 for error 0 for !error

    con1.connect(function(err){
        if(err){
            console.log(err)
            return
        }
        req1.query("EXEC istUser @u = \""+req.body.UserName+"\", @pp = \""+req.body.Password+"\", @e = \""+req.body.Email+"\"", function(err,res){
            if(err){
                console.log('Already Have Account')
                error = 1
                resp.redirect('/Login')
            }
            else{
                console.log('Successfully Created')
                resp.redirect('/Login')
            }
        con1.close()
        })
    })
})

//server start notification
var server = app.listen(3000, () => {
    console.log("Server is listnening on the port 3000");
   });

// static files loaded
app.use("/static", express.static("static"));