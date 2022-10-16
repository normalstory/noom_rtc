import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req,res) => res.render("home"));
app.get("/*",(req,res) => res.redirect("/")); 

const httpServer = http.createServer(app); 
const wsServer = SocketIO(httpServer);

//예약어 connection
wsServer.on("connection", (socket) => {
    socket["nickname"] = "익명";

    socket.onAny((event)=>{
        console.log(`socket event : ${event}`);
    });

    //client에서 던진 이벤트 이름 enter_room
    socket.on("enter_room", (roomName, lastParam) => { 
        socket.join(roomName);
        lastParam(); // run showRoom() on Client( app.js)
        // console.log(socket.id);
        socket.to(roomName).emit("welcomeMsg", socket.nickname);
        // console.log(socket.id);
    });

    //예약어 disconnecting
    socket.on("disconnecting",()=>{
        // console.log(socket.rooms);
        socket.rooms.forEach( (room) => socket.to(room).emit("bye"));
    })

    //*** 예약어 sendMsg */ 
    socket.on("sendMsg", (msg, roomName, lastArg)=>{

        //소속된 방의 참가자들에세 메시지 보내기
        socket.to(roomName).emit("tossMsg", `${socket.nickname} : ${msg}`);
        lastArg();
    })

    //nickname
    socket.on("nickname", (nickname) => socket["nickname"] = nickname);
})

const handleListen = () => console.log('listening on http://localhost:3000'); 
httpServer.listen(3000, handleListen);  