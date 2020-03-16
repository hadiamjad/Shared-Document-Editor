const socket = io('http://localhost:3000')
const textbox = document.getElementById("text-box")


socket.on('chat-message', data =>{
    appendText(data)
})

textbox.addEventListener("input", updateTextBoard => {
    updateTextBoard.preventDefault()
    const textChanges = textbox.value
    socket.emit("msg-to-server", textChanges)
})

function appendText(textChanges){
    textbox.value=textChanges
}