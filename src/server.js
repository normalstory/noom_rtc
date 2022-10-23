import http from "http";
import express from "express";
import SocketIO from "socket.io"; // Signaling Server 역할

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection",(socket)=>{
    // socket.on("join_room",(roomName, done)=>{   //#pair_a1 
    socket.on("join_room",(roomName, done)=>{   //#pair_a1,  *err-3*  
        socket.join(roomName);
        // done();
        socket.to(roomName).emit("welcome"); //#pair_b1
    });
    socket.on("offer", (offer,roomName)=>{
        socket.to(roomName).emit("offer", offer);
    });   //#pair_c2
    socket.on("answer", (answer, roomName)=>{
        socket.to(roomName).emit("answer", answer);
    }); // #pair_d2
    
    socket.on("ice", (ice, roomName)=>{
        socket.to(roomName).emit("ice",ice);
    }); //#pair_e1 합의된 peer들이 Signaling 서버를 통해 candidate를 주고받을 수 있도록 세팅 => ice event를 emit하도록 한다 
});

const handleListen = () => console.log("listening on http://localhost:3000");
httpServer.listen(3000, handleListen);
