import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req,res) => res.render("home"));
app.get("/*",(req,res) => res.redirect("/")); 

const handleListen = () => console.log('listening on http://localhost:3000');

const server = http.createServer(app); 
const wss = new WebSocket.Server({server})

function handelClose(){
    console.log("Disconnected from the Browser")
}

const sockets = [];  
wss.on("connection", (socket)=>{           
    console.log("Connected to Browser");

    sockets.push(socket); 
    socket["nickname"] = "익명"; 
    socket.on("close", handelClose);
    socket.on("message", (message)=>{
        const tossMsg = JSON.parse(message.toString('utf8'));
        
        switch(tossMsg.type){
            case "new-message" : 
                sockets.forEach( eachSocket => eachSocket.send( `${socket.nickname} : ${tossMsg.payload}`));
            case "nick-name" : 
                socket["nickname"] = tossMsg.payload;
        }
    });       
})
   
server.listen(3000,handleListen);  