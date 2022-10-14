const msgForm = document.querySelector("form");
const msgList = document.querySelector("ul");

const socket = new WebSocket(`ws://${window.location.host}`);

function handleOpen(){
    console.log("Connected to Server");
}
function handleMsg(message){
    console.log("Just got this : ", message.data);
}
function handelClose(){
    console.log(" Disconnect from the Server ");
}
socket.addEventListener("open", handleOpen);
socket.addEventListener("message", handleMsg);
socket.addEventListener("close", handelClose);

function handleMsgSubmit(event){
    event.preventDefault();
    // console.log(event);
    const input = document.querySelector("input");
    // console.log(input.value);
    socket.send(input.value);
    input.value="";
}
msgForm.addEventListener("submit", handleMsgSubmit);