import http from "http";
import express from "express";
// import SocketIO from "socket.io";
// * for admin ui ↓
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui"; // -> for admin ui

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req,res) => res.render("home"));
app.get("/*",(req,res) => res.redirect("/")); 

const httpServer = http.createServer(app); 
// const wsServer = SocketIO(httpServer);
// * for admin ui ↓
const wsServer = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true
    }
});
instrument(wsServer, {
    auth: false
}); // -> for admin ui
  
function getPublicRooms(){
    const {
        sockets:
            {adapter:{
                sids, rooms
            },
        },
    } = wsServer;

    const publicRooms =[];
    rooms.forEach((_, keys) => {
        if(sids.get(keys)===undefined){
            publicRooms.push(keys);
        }
    });
    return publicRooms;
}
//set형태로 저장된 room에 사이즈를 통해 참석자 수를 파악하는 함수 생성 : 들어왔을때, 나가기 직전(dis-ing)에.
function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}


//예약어 connection
wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anon";

    socket.onAny((event)=>{
        //adapter check
        console.log(wsServer.sockets.adapter);
        console.log(`socket event : ${event}`);
    });

    //client에서 던진 이벤트 이름 enter_room
    socket.on("enter_room", (roomName, lastParam) => { 
        socket.join(roomName); //#삽질
        lastParam(); 
        //하나의 socket에 메시지 전달 :메시지, 닉네임, 참가자 수 
        socket.to(roomName).emit("welcomeMsg", socket.nickname, countRoom(roomName));
        //서버에 접속한 모든 socket에 메시지 전달 by wsServer
        wsServer.sockets.emit("publicRoomListMsg", getPublicRooms());
    });

    //방을 나간 사용자가 있을때 - 예약어 disconnecting(나가지 직전) :메시지, 닉네임, 참가자 수 
    socket.on("disconnecting",()=>{
        socket.rooms.forEach( (room) => socket.to(room).emit("bye", socket.nickname, countRoom(room)-1));
    })
    //방을 나간 사용자가 있을때 by wsServer - 예약어 disconnect(나간 후)  
    socket.on("disconnect",()=>{
        //서버에 접속한 모든 socket에 메시지 전달
        wsServer.sockets.emit("publicRoomListMsg", getPublicRooms());
    })


    //*** 예약어 sendMsg */ 
    socket.on("sendMsg", (msg, roomName, lastArg)=>{

        //소속된 방의 참가자들에세 메시지 보내기
        socket.to(roomName).emit("tossMsg", `${socket.nickname} : ${msg}`);
        lastArg();
    })

    //nickname
    socket.on("nickname", nickname => socket["nickname"] = nickname);
})

const handleListen = () => console.log('listening on http://localhost:3000'); 
httpServer.listen(3000, handleListen);  