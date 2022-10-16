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
        //하나의 socket에 메시지 전달
        socket.to(roomName).emit("welcomeMsg", socket.nickname);
        //서버에 접속한 모든 socket에 메시지 전달 by wsServer
        wsServer.sockets.emit("publicRoomListMsg", getPublicRooms());
    });

    //방을 나간 사용자가 있을때 - 예약어 disconnecting
    socket.on("disconnecting",()=>{
        socket.rooms.forEach( (room) => socket.to(room).emit("bye", socket.nickname));
    })
    //방을 나간 사용자가 있을때 by wsServer - 예약어 disconnect
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