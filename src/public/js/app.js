const socket = io();

const myFace = document.getElementById("myface");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");


const call = document.getElementById("call");

let myStream; // 오디오 + 비디오
let muted = false;
let cameraOff = false;
let roomName; //handleWelcomeForm()안에 있는 input.value를 나중에도 사용하기 위해 
let myPeerConnection; // peerConnection에 누구나 접속할 수 있도록 

call.hidden=true;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;

      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(devideId) {
  //divideId 없을때
  const initalConstraints = {
    audio: true,
    video: { facingMode: "user" },
  };
  //devideId 있을때
  const cameraConstraints = {
    audio: true,
    video: { devideId: { exact: devideId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      devideId ? cameraConstraints : initalConstraints
    );
    myFace.srcObject = myStream;

    if (!devideId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "UnMute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}
function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    camera.innerText = "Camera Off";
    cameraOff = false;
  } else {
    camera.innerText = "Camera On";
    cameraOff = true;
  }
}
async function handelCameraChange() {
  await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handelCameraChange);



//** welcome form : join a room */
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

//양쪽 브라우저에서 사용되는 코드 *
async function initCall(){
  welcome.hidden=true
  call.hidden=false;
  await getMedia(); //방 진입시,welcome을 숨기소 call ui제공 함수  
  makeConnection(); // 실제로 rtc 연결을 하는 함수
}

async function handleWelcomeForm(event){
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  // socket.emit("join_room",input.value, startMedia); //#pair_a2
  await initCall(); //  *err-2*, 명칭수정  
  socket.emit("join_room",input.value); //#pair_a2
  roomName=input.value; 
  input.value="";
}
//신규 방생성
welcomeForm.addEventListener("submit",handleWelcomeForm);

//Socket code : 다른사람이 내 방에 방문하는 경우 
//#peer A  - offer를 만드는 주체 
socket.on("welcome",async()=>{
  const offer = await myPeerConnection.createOffer(); 
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName); //#pair_c1
}) //#pair_b2

//#peer B - 방문자 
socket.on("offer", async(offer)=>{
  myPeerConnection.setRemoteDescription(offer);
  const answer= await myPeerConnection.createAnswer(); //
  // answer를 peer B로 전달 
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer",answer);  //#pair_d1
});  //#pair_c3

//#peer A  
socket.on("answer", (answer)=>{
  myPeerConnection.setRemoteDescription(answer); // answer를 받은 peer A 도 이제, LocalDescription와 RemoteDescription 모두를 갖게됨 
})  //#pair_d3


//RTC code - addStream 대신 사용할 함수 세팅 : track들을 개별적으로 추가 
function makeConnection(){
  myPeerConnection = new RTCPeerConnection(); 
  myStream 
    .getTracks()
    .forEach((track)=>myPeerConnection.addTrack(track, myStream)); 
}