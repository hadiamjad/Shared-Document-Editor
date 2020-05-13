const io = require('socket.io')(3000)
const io2 = require('socket.io')(3001)
const sql = require("mssql")
const dbConfig = {
    server: "DESKTOP-DL240JO",
    database: "Docs",
    user: "hadi",
    password: "123"
}


io.on('connection', socket =>{
    socket.on('msg-to-server', textChanges => {
        setDbms(textChanges);
        socket.broadcast.emit('chat-message', textChanges)
    })
})

function setDbms(textChanges){
    var con = new sql.ConnectionPool(dbConfig)
    var req = new sql.Request(con)

    con.connect(function(err){
        if(err){
            console.log(err)
            return
        }
        req.query("Insert into DataText values(2,'"+textChanges+"','Hadi')")

        req.query("UPDATE DataText SET dataTxt = '"+textChanges+"'")
        con.close()
    })
}
