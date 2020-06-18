const express = require('express')
const fs = require('fs');
const bodyParser = require('body-parser')
const path = require('path')
var getDocs = require('C:/Users/Haadi/Desktop/latest project/Shared-Document-Editor/model/DocsEngine.js');
const nodemailer = require('nodemailer');

var homepage = new getDocs.Homepage();

var CurrentUser = null
var ClickedDoc = null

const sql = require("mssql")
const dbConfig = {
    server: "DESKTOP-DL240JO",
    database: "Docs",
    user: "hadi",
    password: "123"
}
var app = express()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var io = new Array(300)
for (i = 0; i < 300; i++) {
    io[i] = require('socket.io')(5000 + i);
    io[i].on('connection', socket => {
        socket.on('msg-to-server', data => {
            setDbms(data.textChanges, data.docID);
            socket.broadcast.emit('chat-message', data.textChanges)
        })
        socket.on('mouse-activity', data=>{
            //console.log(data)
            socket.broadcast.emit('cursor', data)
        })
    })
}
////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////
function setDbms(textChanges, docid) {
    var con = new sql.ConnectionPool(dbConfig)
    var req1 = new sql.Request(con)
    con.connect(function (err) {
        if (err) {
            console.log(err)
            return
        }
        req1.query("UPDATE Document SET dataTxt = '" + textChanges + "' where DocID=" + docid + " ", function (err, res) {
            if (err) {
                console.log('Query')
                error = 1
            }
            else {
                //console.log("successful doc textbox")
            }

            con.close()
        })
    })
}

// Login landing page is loded
app.get(["/", "/Login"], function (request, response) {
    filePath = "view/Login.html"

    fs.readFile(filePath, function (err, contents) {
        response.send(contents.toString())
    })
})

// Register landing page is loded
app.get(["/Register"], function (request, response) {
    filePath = "view/Register.html"

    fs.readFile(filePath, function (err, contents) {
        response.send(contents.toString())
    })
})

// editor landing page is loded
app.get(["/editor"], function (request, response) {
    var con1 = new sql.ConnectionPool(dbConfig)
    var req1 = new sql.Request(con1)
    var dbout;
    con1.connect(function (err) {
        if (err) {
            console.log(err)
            return
        }
        req1.query("EXEC getDocs @ID = " + ClickedDoc + " ", function (err, res) {
            if (err) {
                console.log('Query')
                error = 1
            }
            else {

                value = "var user = \"" + CurrentUser + "\"";
                docid = "var docid = " + ClickedDoc + "";
                socket = "const socket = io('http://localhost:" + res.recordset[0].socket + "')";
                scripttag = "<script defer src = \"http://localhost:" + res.recordset[0].socket + "/socket.io/socket.io.js\"></script>";
                data = 'var data = \'' + String(res.recordset[0].dataTxt) + '\'';
                doc_name = "<input id=\"Name_document\"  value=\"" + res.recordset[0].title + "\" >"
                CurrentUser = null;
                ClickedDoc = null;

                filePath = "view/index.html"


                fs.readFile(filePath, function (err, contents) {
                    contents = contents.toString().replace("/*username*/", value)
                    contents = contents.toString().replace("/*docid*/", docid)
                    contents = contents.toString().replace("/*socket*/", socket)
                    contents = contents.toString().replace("/*data*/", data)
                    contents = contents.toString().replace("<!-- Name_document -->", doc_name)
                    contents = contents.toString().replace("<!-- script -->", scripttag)
                    response.send(contents);
                })
            }

            con1.close()
        })
    })

})

// Document list landing page is loded
app.get(["/Docs"], function (request, response) {
    var sharedDocs = " ";
    homepage.loadcollabDocuments(CurrentUser, function (docs) {
        for (i = 0; i < docs.length; i++) {
            sharedDocs += docs[i].generateHtmlforHomepage2();
        }
    })
    homepage.loadDocuments(CurrentUser, function (docs) {
        var html = ""

        for (i = 0; i < docs.length; i++) {
            html += docs[i].generateHtmlforHomepage();
        }

        filePath = "view/Docx.html"
        value = "var user = \"" + CurrentUser + "\"";
        CurrentUser = null;

        fs.readFile(filePath, function (err, contents) {
            contents = contents.toString().replace("<!-- content -->", html);
            contents = contents.toString().replace("<!-- sharedDocs -->", sharedDocs);
            contents = contents.toString().replace("/*username*/", value)
            response.send(contents);
        });

    });
})

// post request handler for get documentpage
app.post('/Docs', urlencodedParser, function (req, response) {
    CurrentUser = req.body.email
    response.send("Succesful")
})

// post request handler for delete documentpage
app.post('/deleteDocs', urlencodedParser, function (req, response) {
    var con1 = new sql.ConnectionPool(dbConfig)
    var req1 = new sql.Request(con1)

    con1.connect(function (err) {
        if (err) {
            console.log(err)
            return
        }
        req1.query("EXEC delDocs @ID = " + req.body.id + " ", function (err, res) {
            if (err) {
                console.log('Query')
                error = 1
            }
            con1.close()
        })
    })
    response.send("Succesful /deleteDocs post request ")
})

// post request handler for collaborator documentpage
app.post('/collab', urlencodedParser, function (req, response) {
    var con1 = new sql.ConnectionPool(dbConfig)
    var req1 = new sql.Request(con1)

    con1.connect(function (err) {
        if (err) {
            console.log(err)
            return
        }
        req1.query("EXEC istCollab @e = \"" + req.body.email + "\", @ID = " + req.body.docID + " ", function (err, res) {
            if (err) {
                console.log('Query error in colloaborator')
                error = 1
            }
            else {
                //let transport = nodemailer.createTransport(options[defaults])
                var transport = nodemailer.createTransport({
                    host: "smtp.mailtrap.io",
                    port: 2525,
                    auth: {
                        user: "f3abc83182bf3f",
                        pass: "6a26fe81fc9164"
                    }
                });
                const message = {
                    from: 'notepad@no-reply.com', // Sender address
                    to: req.body.email,         // List of recipients
                    subject: 'NotePad Collaborator', // Subject line
                    text: '' + req.body.creator + ' have shared his docx for collaboration. '// Plain text body
                };
                transport.sendMail(message, function (err, info) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(info);
                    }
                });
            }
            con1.close()
        })
    })
    response.send("Succesful /collab post request ")
})

// post request handler for collaborator list documentpage
app.post('/collabList', urlencodedParser, function (req, response) {
    var con1 = new sql.ConnectionPool(dbConfig)
    var req1 = new sql.Request(con1)

    con1.connect(function (err) {
        if (err) {
            console.log(err)
            return
        }
        req1.query("Select * from DocumentEditors where DocsID = " + req.body.docID + " ", function (err, res) {
            if (err) {
                console.log('Query error in colloaboratorList')
                error = 1
            }
            response.send(res)
            con1.close()
        })
    })

})

// post request handler for newDoc
app.post('/newDocs', urlencodedParser, function (req, response) {
    var con1 = new sql.ConnectionPool(dbConfig)
    var req1 = new sql.Request(con1)

    con1.connect(function (err) {
        if (err) {
            console.log(err)
            return
        }
        req1.query("EXEC istDocs @e =\"" + req.body.email + "\"", function (err, res) {
            if (err) {
                console.log('Query in')
                error = 1
            }
            con1.close()
        })
    })
    response.send("Succesful /newDoc post request ")
})


// post request handler for newDoc
app.post('/nameChange', urlencodedParser, function (req, response) {
    var con1 = new sql.ConnectionPool(dbConfig)
    var req1 = new sql.Request(con1)

    con1.connect(function (err) {
        if (err) {
            console.log(err)
            return
        }
        req1.query("UPDATE Document SET title = '" + req.body.value + "' where DocID=" + req.body.docID + " ", function (err, res) {
            if (err) {
                console.log('Query in')
                error = 1
            }
            con1.close()
        })
    })
    response.send("Succesful /deleteDocs post request ")
})

// post request handler for delCollab
app.post('/remCollab', urlencodedParser, function (req, response) {
    var con1 = new sql.ConnectionPool(dbConfig)
    var req1 = new sql.Request(con1)

    con1.connect(function (err) {
        if (err) {
            console.log(err)
            return
        }
        req1.query("Delete from DocumentEditors where email = '" + req.body.email + "' and DocsID=" + req.body.docID + " ", function (err, res) {
            if (err) {
                console.log('Query in')
                error = 1
            }
            con1.close()
        })
    })
    response.send("Succesful /deleteDocs post request ")
})

// post request handler for clickDoc
app.post('/clickDocs', urlencodedParser, function (req, response) {
    CurrentUser = req.body.email
    ClickedDoc = req.body.id
    response.send("Succesful")
})

//login form request handler
app.post('/login', urlencodedParser, function (req, resp) {
    var con1 = new sql.ConnectionPool(dbConfig)
    var req1 = new sql.Request(con1)

    var flag = 0; // 1 for error 0 for !error

    con1.connect(function (err) {
        if (err) {
            console.log(err)
            return
        }
        /*req1.query("EXEC LoginReq @pp = \""+req.body.Password+"\", @e = \""+req.body.Email+"\"", function(err,res){
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
                    resp.send(req.body.Email)                
                }
            }*/
        req1.query("EXEC LoginReq1 @e = \"" + req.body.Email + "\"", function (err, res) {
            if (err) {
                console.log('Login check SQL Error')
                error = 1
            }
            else {
                if (res.rowsAffected[0] == 0) {
                    resp.send('Account doesnot exist.')
                    error = 1
                    //con1.close()
                }
                else {
                    req1.query("EXEC LoginReq @pp = \"" + req.body.Password + "\", @e = \"" + req.body.Email + "\"", function (err, res) {
                        if (err) {
                            console.log('Login check SQL Error1')
                            error = 1
                        }
                        //this is new part
                        else {
                            if (res.rowsAffected[0] == 0) {
                                resp.send('Username password does not match.')
                                error = 1
                            }
                            else {
                                resp.send(req.body.Email)
                            }
                        }
                        con1.close()
                    })
                }
            }
        })
    })
})

//register form request handler
app.post('/register', urlencodedParser, function (req, resp) {
    var con1 = new sql.ConnectionPool(dbConfig)
    var req1 = new sql.Request(con1)
    console.log(req.body)
    var flag = 0; // 1 for error 0 for !error

    con1.connect(function (err) {
        /*if(err){
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
        })*/
        if (err) {
            console.log(err)
            return
        }
        req1.query("EXEC istUser @u = \"" + req.body.UserName + "\", @pp = \"" + req.body.Password + "\", @e = \"" + req.body.Email + "\"", function (err, res) {
            if (err) {
                resp.send('Already Have Account.')
                error = 1
                //resp.redirect('/Login')
            }
            else {
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