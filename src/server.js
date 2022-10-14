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

//dummy db for divide for user
const sockets = [];  

wss.on("connection", (socket)=>{           
    console.log("Connected to Browser");

    sockets.push(socket); //divide for user
    socket["nickname"] = "익명"; // 초기값(익명, 닉네임을 입력하지 않은 경우)

    //대기 중인 각각의 소캣 이벤트 항목 
    socket.on("close", handelClose);
    socket.on("message", (message)=>{
        const tossMsg = JSON.parse(message.toString('utf8')); //string to js object
        
        switch(tossMsg.type){
            case "new-message" : 
                // sockets.forEach( (eachSocket) => eachSocket.send(tossMsg.payload));
                sockets.forEach( eachSocket => eachSocket.send( `${socket.nickname} : ${tossMsg.payload}`));
            case "nick-name" : 
                // console.log(tossMsg.payload,"님이 입장하셨습니다.");
                socket["nickname"] = tossMsg.payload;
        }
        // if(tossMsg.type==="new-message"){
        //     sockets.forEach( (eachSocket) => eachSocket.send(tossMsg.payload));
        // }else if(tossMsg.type==="nick-name"){
        //     console.log(tossMsg.payload,"님이 입장하셨습니다.")
        // }
    });       
})
   
server.listen(3000,handleListen);  