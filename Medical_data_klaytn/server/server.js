const express = require('express');
const path = require('path');
const router = require('./route/router');

const app = express();
const PORT = process.env.PORT || 8081;
 
app.use(express.static(path.join(__dirname, '..', 'public/')));
 
app.use('/', router);// /로 시작되는 모든 url요청을 router.js로 넘김
 
// 모든 요청에 대한 get post 함수를 router.js파일에서 관리하면 된다.
 
app.listen(PORT, () => {
    console.log(`Check out the app at http://54.180.37.223:${PORT}`);
});
