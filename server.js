const io = require('socket.io')(3000)

io.on('connection', socket =>{
    socket.on('msg-to-server', textChanges => {
        socket.broadcast.emit('chat-message', textChanges)
    })
})