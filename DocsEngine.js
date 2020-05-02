var events = require('events');
var eventEmitter = new events.EventEmitter();

const sql = require("mssql")
const dbConfig = {
    server: "DESKTOP-DL240JO",
    database: "Docs",
    user: "hadi",
    password: "123"
}

class Document{
    constructor(T,D=null,E=null,S,SU=null){
        this.Title=T;
        this.Description=D;
        this.Email=E;
        this.SocketIO=S;
        this.SharedUsersList=SU;
    }
    generateHtmlforHomepage(){
        var html="<div class='Box' >"
        html+="<div class='Title'>" +this.Title+"</div>";
        html+="<div class='Icons row ml-auto'><div class='Share col-sm-1'><i class='fas fa-user-friends'></i></div><div class='Delete col-sm-1'><i class='fas fa-trash-alt'></i></div></div></div>"
    
        return html;
    }
}

class Homepage{
    constructor(){
        this.Documents=[];
        this.status="NotLoaded";
        
    }
    loadDocuments(str, cb){
        var loadDocumentsHelper = function(result){
            for(var c=0;c<result.rowsAffected[0];c++){
                this.Documents[c]=new Document(result.recordset[c].title, result.recordset[c].dataTxt,result.recordset[c].creator,result.recordset[c].socket);
            }
            cb(this.Documents);
           
        }
                  //hadis chunk
                  loadDocumentsHelper = loadDocumentsHelper.bind(this);

                  var con1 = new sql.ConnectionPool(dbConfig)
                  var req1 = new sql.Request(con1)
      
                  con1.connect(function(err){
                      if(err){
                          console.log(err)
                          return
                      }
                      req1.query("EXEC retDocs @e = \""+str+"\"", function(err,res){
                          if(err){
                              console.log('Query')
                              error = 1
                          }
                          else{
                               loadDocumentsHelper(res)     
                          }
                      con1.close()
                      })
                  })
      
                  
                  this.status="Loaded";
                  eventEmitter.emit("Loaded");
                   
    }

    load(){
        this.loadDocuments();
    }
    on(e,cb){
        eventEmitter.on(e,cb);
    }
}

module.exports={
    Document:Document,
    Homepage:Homepage

};