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

wsServer.on("connection", (socket) => {
    socket.onAny((event)=>{
        console.log(`socket event : ${event}`);
    });

    //client에서 던진 이벤트 이름
    socket.on("enter_room", (roomName, lastParam) => { 
        socket.join(roomName);
        lastParam(); // run showRoom() on Client( app.js)
        console.log(socket.id);
        socket.to(roomName).emit("welcomeMsg");
        console.log(socket.id);
    });
})

const handleListen = () => console.log('listening on http://localhost:3000'); 
httpServer.listen(3000, handleListen);  