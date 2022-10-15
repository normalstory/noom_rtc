const socket = io();

const welcome = document.querySelector("#welcome");
const form = document.querySelector("form");
const room = document.querySelector("#room");

room.hidden = true;

let roomName;

function addMsg(msg){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    console.log(msg);
    li.innerText = msg;
    ul.appendChild(li);
}
function showRoom(){
    welcome.hidden=true;
    room.hidden=false;
    const h3 = room.querySelector("h3");
    h3.innerText=`Room : ${roomName}`;
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom); //server 받을 이벤트 이름
    roomName=input.value;
    input.value="";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcomeMsg", () => {
    addMsg("someone joined!");
});
socket.on("bye", () => {
    addMsg("someone left! TT");
});