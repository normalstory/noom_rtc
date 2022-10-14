import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req,res) => res.render("home"));
app.get("/*",(req,res) => res.redirect("/")); //catchall url 설정

const handleListen = () => console.log('listening on http://localhost:3000'); // ws://localhost:3000
// app.listen(3000, handleListen);

// express(http용)에 ws도 함께 사용할 수 있도록 서버를 객체로 선언 
const server = http.createServer(app); // http server 
const wss = new WebSocket.Server({server}) // http server를 재사용하는 WebSocket server 

wss.on("connection", (socket)=>{             // 샘플 1-1. 웹소켓 연결  
    console.log("Connected to Browser");
    socket.on("close", ()=>console.log("Disconnected from the Browser"))  // Browser 탭 또는 창이 닫힐때 실행 
  
    socket.send("Hello Client!");            // 샘플 2-1. 메시지 송신  
    socket.on("message", (message) => {      // 샘플 3-2. 이번엔 클라이언트로 부터 메시지 수신
        // console.log(message);  //인코딩에러
        console.log(message.toString('utf8')); // 샘플 3-2. + 인코딩 수정 
    }) 
})

server.listen(3000,handleListen);