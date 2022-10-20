//** 1차 개발 스터디_bk4chat 백업4채팅 */

const socket = io();

const welcome = document.querySelector("#welcome");
const form = document.querySelector("form");
const room = document.querySelector("#room");

room.hidden = true;

let roomName;

function handleNameSave(event) {
  event.preventDefault();
  const input = room.querySelector("#name input");
  socket.emit("nickname", input.value);
}
function handleMsgSend(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");

  //*** */
  const inputMsg = input.value;
  socket.emit("sendMsg", inputMsg, roomName, () => {
    // arg2는 소캣통신 데이터, 여기 익명함수 내용은 내게 출력되는 메시지
    addMsg(`You: ${inputMsg}`);
  });
  input.value = "";
}
function addMsg(msg) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  console.log(msg);
  li.innerText = msg;
  ul.appendChild(li);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  //방이름
  const h3 = room.querySelector("h3");
  h3.innerText = `Room : ${roomName}`;

  //이벤트 리스닝하기 - form
  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMsgSend);
  //닉네임 받기 - form
  const nameForm = room.querySelector("#name");
  nameForm.addEventListener("submit", handleNameSave);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom); //server 받을 이벤트 이름
  roomName = input.value;
  input.value = "";
}

welcome.addEventListener("submit", handleRoomSubmit);

socket.on("welcomeMsg", (userCome, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room : ${roomName} (${newCount} 명 - 참여 중)`;
  addMsg(`${userCome} arrived!`);
});
socket.on("bye", (userLeft, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room : ${roomName} (${newCount} 명 - 참여 중)`;
  addMsg(`${userLeft} left ㅜㅜ`);
});
socket.on("tossMsg", addMsg);
socket.on("publicRoomListMsg", (rooms) => {
  const roomList = welcome.querySelector("ul");

  //개별 클라이언트의 상태가 변경(새로고침) 할 때마다 룸 목록 초기화
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  //방 목록
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.appendChild(li);
  });
});
