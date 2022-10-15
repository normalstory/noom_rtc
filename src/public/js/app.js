const socket = io();

const welcome = document.querySelector("#welcome");
const form = document.querySelector("form");

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room",{payload:input.value},()=>{
        console.log(`This func that the last argument for socket.emit() 
                     that executed by F after call by B`);
    });
    input.value="";
}

form.addEventListener("submit", handleRoomSubmit);