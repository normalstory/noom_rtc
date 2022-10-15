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
    socket.on("enter_room", (msg, param3th) => {
        console.log(msg);
        setTimeout(()=>{
            //app.js에 있는 socket.emit(”event”, {object}, ()⇒{…})에 담았던 세번째 argument
            param3th(); 
        },10000);
    });
})

const handleListen = () => console.log('listening on http://localhost:3000'); 
httpServer.listen(3000,handleListen);  