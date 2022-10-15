const nameForm = document.querySelector("#inputName");
const msgForm = document.querySelector("#inputMsg");
const msgList = document.querySelector("ul");

const socket = new WebSocket(`ws://${window.location.host}`);

function makeMsg(type, payload){
    const sendMsg = {type, payload};
    return JSON.stringify(sendMsg);
}

socket.addEventListener("open", () =>{
    console.log("Connected to Server");
});
socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    msgList.appendChild(li);
});
socket.addEventListener("close", () => {
    console.log(" Disconnect from the Server ");
});

function handleMsgSubmit(event){
    event.preventDefault();
    const input = msgForm.querySelector("input");
    socket.send(makeMsg("new-message",input.value));
    input.value="";
}
function handleNameSave(event){
    event.preventDefault();
    const input = nameForm.querySelector("input");
    socket.send(makeMsg("nick-name",input.value));
}
msgForm.addEventListener("submit", handleMsgSubmit);
nameForm.addEventListener("submit", handleNameSave);