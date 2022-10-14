const nameForm = document.querySelector("#inputName");
const msgForm = document.querySelector("#inputMsg");
const msgList = document.querySelector("ul");

const socket = new WebSocket(`ws://${window.location.host}`);

//js object to string : 중립성. 수렴하는 서버의 환경이 다를 수 있다. 
function makeMsg(type, payload){
    const sendMsg = {type, payload};
    return JSON.stringify(sendMsg);
}

function handleOpen(){
    console.log("Connected to Server");
}
function handleMsg(message){
    // console.log("Just got this : ", message.data);
    const li = document.createElement("li");
    li.innerText = message.data;
    msgList.appendChild(li);
}
function handelClose(){
    console.log(" Disconnect from the Server ");
}
socket.addEventListener("open", handleOpen);
socket.addEventListener("message", handleMsg);
socket.addEventListener("close", handelClose);

function handleMsgSubmit(event){
    event.preventDefault();
    const input = msgForm.querySelector("input");
    socket.send(makeMsg("new-message",input.value));
    input.value="";
}
function handleNameSave(event){
    event.preventDefault();
    const input = nameForm.querySelector("input");
    // console.log(input.value, "님이 입장하셨습니다.")

    // socket.send(JSON.stringify({
    //     type:"nickname",
    //     payload:input.value,
    // }));
    socket.send(makeMsg("nick-name",input.value));
}
msgForm.addEventListener("submit", handleMsgSubmit);
nameForm.addEventListener("submit", handleNameSave);