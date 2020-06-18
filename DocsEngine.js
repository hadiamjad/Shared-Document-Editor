var events = require('events');
var eventEmitter = new events.EventEmitter();

const sql = require("mssql")
const dbConfig = {
    server: "DESKTOP-DL240JO",
    database: "Docs",
    user: "hadi",
    password: "123"
}

class Document {
    constructor(I, T, D = null, E = null, S, SU = null) {
        this.id = I,
            this.Title = T;
        this.Description = D;
        this.Email = E;
        this.SocketIO = S;
        this.SharedUsersList = SU;
    }

    generateHtmlforHomepage() {
        var html = "<div class='Box' id='" + this.id + "'>"
        html += "<div class='Title'>" + this.Title + "</div>";
        html += "<div class='Icons row ml-auto'><div class='Share col-sm-1' id='" + this.id + "' data-toggle='modal' data-target='#myModel'><i class='fas fa-user-friends'></i></div><div class='Delete col-sm-1'  id='" + this.id + "' ><i class='fas fa-trash-alt'></i></div></div></div>"

        return html;
    }

    generateHtmlforHomepage2() {
        var html = "<div class='Box' id='" + this.id + "'>"
        html += "<div class='Title'>" + this.Title + "</div>";
        html += "<div class='Icons row ml-auto'></div>"

        return html;
    }
}

class Homepage {
    constructor() {
        this.Documents = [];
        this.status = "NotLoaded";

    }
    loadDocuments(str, cb) {
        var loadDocumentsHelper = function (result) {
            this.Documents = []
            for (var c = 0; c < result.rowsAffected[0]; c++) {
                this.Documents[c] = new Document(result.recordset[c].DocID, result.recordset[c].title, result.recordset[c].dataTxt, result.recordset[c].creator, result.recordset[c].socket);
            }
            cb(this.Documents);

        }
        //hadis chunk
        loadDocumentsHelper = loadDocumentsHelper.bind(this);

        var con1 = new sql.ConnectionPool(dbConfig)
        var req1 = new sql.Request(con1)

        con1.connect(function (err) {
            if (err) {
                console.log(err)
                return
            }
            req1.query("EXEC retDocs1 @e = \"" + str + "\"", function (err, res) {
                if (err) {
                    console.log('Query')
                    error = 1
                }
                else {

                    loadDocumentsHelper(res)
                }
                con1.close()
            })
        })


        this.status = "Loaded";
        eventEmitter.emit("Loaded");

    }

    loadcollabDocuments(str, cb) {
        var loadDocumentsHelper2 = function (result) {
            this.Documents = []
            for (var c = 0; c < result.rowsAffected[0]; c++) {
                this.Documents[c] = new Document(result.recordset[c].DocID, result.recordset[c].title, result.recordset[c].dataTxt, result.recordset[c].creator, result.recordset[c].socket);
            }
            cb(this.Documents);

        }
        //hadis chunk
        loadDocumentsHelper2 = loadDocumentsHelper2.bind(this);

        var con1 = new sql.ConnectionPool(dbConfig)
        var req1 = new sql.Request(con1)

        con1.connect(function (err) {
            if (err) {
                console.log(err)
                return
            }
            req1.query("EXEC retDocs @e = \"" + str + "\"", function (err, res) {
                if (err) {
                    console.log('Query inside collab')
                    error = 1
                }
                else {

                    loadDocumentsHelper2(res)
                }
                con1.close()
            })
        })


        this.status = "Loaded";
        eventEmitter.emit("Loaded");

    }

    load() {
        this.loadDocuments();
    }
    on(e, cb) {
        eventEmitter.on(e, cb);
    }
}

module.exports = {
    Document: Document,
    Homepage: Homepage
};