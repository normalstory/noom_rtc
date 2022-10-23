import http from "http";
import express from "express";
import SocketIO from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection",(socket)=>{
    socket.on("join_room",(roomName, done)=>{   //#pair_a1
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome"); //#pair_b1
    });
    socket.on("offer", (offer,roomName)=>{
        socket.to(roomName).emit("offer", offer);
    });   //#pair_c2
})

const handleListen = () => console.log("listening on http://localhost:3000");
httpServer.listen(3000, handleListen);
