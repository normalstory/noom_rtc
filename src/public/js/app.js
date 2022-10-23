const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream; // 오디오 + 비디오
let muted = false;
let cameraOff = false;
let roomName; //handleWelcomeForm()안에 있는 input.value를 나중에도 사용하기 위해 
let myPeerConnection; // peerConnection에 누구나 접속할 수 있도록 

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

async function getMedia(deviceId) {
  //deviceId 없을때
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  //deviceId 있을때
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

function toggleMute(){
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}
function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  toggleMute();
}
function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    // console.log(myPeerConnection.getSenders());
    // Sender - peer로 보내진 media stream track을 컨트롤

    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
    toggleMute();
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);



//** welcome form : join a room */
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

//양쪽 브라우저에서 사용되는 코드 *
async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia(); //방 진입시,welcome을 숨기소 call ui제공 함수  
  makeConnection(); // 실제로 rtc 연결을 하는 함수
};

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  // socket.emit("join_room",input.value, startMedia); //#pair_a2
  await initCall(); //  *err-2*, 명칭수정  
  socket.emit("join_room", input.value); //#pair_a2
  roomName = input.value;
  input.value = "";
}
//신규 방생성
welcomeForm.addEventListener("submit", handleWelcomeSubmit);

//*** Socket code : 다른사람이 내 방에 방문하는 경우 
//#peer A  - offer를 만드는 주체 
socket.on("welcome", async ()=>{
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName); //#pair_c1
}); //#pair_b2

//#peer B - 방문자 
socket.on("offer", async (offer) => {
  console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  // answer를 peer B로 전달 
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName); //#pair_d1
  console.log("sent the answer");
}); //#pair_c3

//#peer A  
socket.on("answer", (answer) => {
  console.log("received the answer");
  // answer를 받은 peer A 도 이제, LocalDescription와 RemoteDescription 모두를 갖게됨 
  myPeerConnection.setRemoteDescription(answer);
});  //#pair_d3

// ice event
socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
}); //#pair_e3


//*** RTC code - addStream 대신 사용할 함수 세팅 : track들을 개별적으로 추가 
function makeConnection() {
  myPeerConnection = new RTCPeerConnection(); 
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

// icecandidate 연결(offer와 answer를 통해 상호합의)된 peer끼리만 공유하는- 소통방식을 담은 데이터이다. 
function handleIce(data) {
  console.log("sent candidate");
  socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream;
}