const socket = io();

const myFace = document.getElementById("myface");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");


const call = document.getElementById("call");

let myStream; // 오디오 + 비디오
let muted = false;
let cameraOff = false;
let roomName;

call.hidden=true;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    // console.log(cameras);
    // console.log(myStream.getVideoTracks());
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
  //devideId 없을때
  const initalConstraints = {
    audio: true,
    video: { facingMode: "user" },
  };
  //devideId 있을때
  const cemeraConstraints = {
    audio: true,
    video: { devideId: { exact: devideId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      //   {
      //   audio: true, // = constraints
      //   video: true,
      // } 위에서 devideId 유무에 대한 처리 진행
      devideId ? cemeraConstraints : initalConstraints
    );
    // console.log(myStream);
    myFace.srcObject = myStream;

    if (!devideId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}
// getMedia();

function handleMuteClick() {
  // console.log(myStream.getAudioTracks());
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    mute.innerText = "UnMute";
    muted = true;
  } else {
    mute.innerText = "Mute";
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
function startMedia(){
  welcome.hidden=true
  call.hidden=false;
  getMedia();
}

function handelWelcomeForm(event){
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  // console.log(input.value);
  socket.emit("join_room",input.value, startMedia); //#pair_a2
  roomName=input.value; //나중에 현재 방이름을 다시 알(쓸) 수 있도록 전역변수를 선언해서 담는다 
  input.value="";
}
//신규 방생성
welcomeForm.addEventListener("submit",handelWelcomeForm);

//socket code : 다른사람이 내 방에 방문하는 경우 
socket.on("welcome",()=>{ //#pair_b2
  console.log("someone joined");
})