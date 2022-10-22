const socket = io();

const myFace = document.getElementById("myface");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

let myStream; // 오디오 + 비디오
let muted = false;
let cameraOff = false;

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    // console.log(myStream);
    myFace.srcObject = myStream;
  } catch (e) {
    console.log(e);
  }
}
getMedia();

function handelMuteClick() {
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
function handelCameraClick() {
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
muteBtn.addEventListener("click", handelMuteClick);
cameraBtn.addEventListener("click", handelCameraClick);
