// alert("hello world");

// ws에 연결을 요청하고, 받을 오브젝트 선언 
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", ()=>{            // 샘플1-2. 웹소캣 연결 대기& 확인 
    console.log("Connected to Server");
})
socket.addEventListener("message", (message)=>{  // 샘플2-2. 메시지 수신 대기& 확인 
    console.log("Just got this : ", message.data);
    
})
socket.addEventListener("close", ()=>{
    console.log(" Disconnect from the Server ");
})

setTimeout( () => {
socket.send("HelLo Server? from the Browser!");  // 샘플 3-1 이번엔 브라우저에서 먼저 메시지를 보내는 경우 
}, 10000);