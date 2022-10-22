# Noom

줌 클론한 놈 ;D 

"zoom clone using nodeJS, webRTC and Web sockets"

## Server Setup

Babel, Nodemon, Express를 활용한 node 속성의 서버 생성

1. npm init -y
2. touch README.md
3. npm i nodemon -D
4. babel.config.json , nodemon.json, src/server.js 생성
5. git init .
6. npm i @babel/core @babel/cli @babel/node @babel/preset-env -D
7. touch .gitignore
8. npm i express
9. npm i pug
10. npm run dev

## Frontend Setup

- Pug로 view engine 설정
- Express에 template이 어디 있는지 지정
- public url생성해서 유저에게 파일공유
- home.pug를 render해주는 route handler 생성
- home.pug에 mvp.css 링크 연결
- public/js/app.js 스크립트 확인
