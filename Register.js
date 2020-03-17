const socket = io('http://localhost:3001')

const email = document.getElementById("Email_PlaceHolder")
const password = document.getElementById("Password_PlaceHolder")
const username = document.getElementById("UserName")
const btn = document.getElementById("Register_btn")

var arr = []

btn.addEventListener("click", registry => {
    registry.preventDefault()

    arr[0] = email.value
    arr[1] = password.value
    arr[2] = username.value

    socket.emit("registry-coming", arr)

})


