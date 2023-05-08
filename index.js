const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 3000;

require('dotenv').config();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());



// const db_database = !module.parent ? process.env.db_database_test : process.env.db_database
const conn = {
  host : process.env.db_host,
  port : process.env.db_port,
  user : process.env.db_user,
  password : process.env.db_password,
  database : process.env.db_database_test
};

const connection = mysql.createConnection(conn);

//내 일정 부분에 일정 보여주기
app.get('/location', (req,res) => {
  connection.connect();
  connection.query('select id, turn, location_name, address, mapx, mapy from location order by turn',function(error,results,fields) {
    if (error) {
      console.log('db connection error');
      res.statusCode(500);
    }
    // console.log('results', results);
    connection.end();
    res.status(200).send(results);
  });
});

//search_api 에서 찾은 결과를 내 일정에 추가하기
app.post('/location', (req,res) => {
  connection.connect();
  const input = req.body;
  if(!input.turn || !input.location_name || !input.address || !input.mapx || !input.mapy) {
    connection.end();
    res.status(400);
    res.end();
  } else {
    let datas = [
      input.turn,
      input.location_name,
      input.address,
      input.mapx,
      input.mapy
  ];
  connection.query("insert into location values(null,?,?,?,?,?,now(),now())",datas, function (error, results, fields) {
    if (error) {
      connection.end();
      console.log('db connection error');
      res.status(500);
      res.end();
    }
    connection.end();
    res.status(201);
    res.end();
  });
  }
});

//일정 삭제
app.delete('/location:id',(req,res) => {
  connection.connect();
  if (!req.params.id) {
    res.status(400);
    res.end();
  } else {
    let id = req.params.id;
    connection.query("delete from location where id = ?;",id, function (error, results, fields) {
      if (error) {
        console.log('db connection error');
        res.status(500);
        res.end();
      }
      res.status(200);
      res.end();
    });
  }
});

//일정 순서 바꾸기
app.put('/location', (req,res) => {
  connection.connect();
  let fst_datas = [
      req.body.fst_turn,
      req.body.fst_id
  ];
  let snd_datas = [
    req.body.snd_turn,
    req.body.snd_id
  ]
  connection.query("update location set turn = ? where id = ?",fst_datas,function (error, results, fields) {
    if (error) {
      console.log('db connection error');
      res.status(500);
      res.end();
    }
    connection.query("update location set turn = ? where id = ?",snd_datas,function (error, results, fields) {
      if (error) {
        console.log('db connection error');
        res.status(500);
        res.end();
      }
      res.status(200);
      res.end();
  });
  });

});


//Node.js 모듈 시스템에서는, 모듈을 불러오는 require() 함수를 사용하여 다른 모듈을 가져올 수 있습니다. 이때, 불러온 모듈은 자체적인 스코프를 가지며, 이 스코프 내에서 전역 변수가 아닌 변수는 모두 지역 변수로 취급됩니다.
//module.parent 변수는 현재 모듈을 불러온 부모 모듈을 가리키므로, module.parent === null 일 경우 현재 모듈이 직접 실행되었다는 것을 의미합니다. 이를 이용하여, 다른 모듈에서 현재 모듈이 직접 실행되었는지, 아니면 다른 모듈에서 불러와서 사용되었는지를 구분할 수 있습니다.
// 직접 실행되면
if (!module.parent) {
  app.listen(port, '0.0.0.0', async () => {
    console.log('=========================================');
    console.log(`Application is running on port : ${port}`);
    console.log('=========================================');
  });
}


// 질문 :커넥션 끊으면 (res.send()로 다른 데이터는 보내짐, 상태코드도 잘 보내짐) 근데 results 만 안보내지는 이유는 db커넥션이 필요한 작업이라서?
// 답 : db를 다녀오는 것은 비동기처리가 필요한 작업이다 마지막에 커넥션.end을 쓰게 되면 db다녀오기전에 커넥션이 끊어져 데이터를 받아올 수 없다.
// send등의 작업은 빠르게 실행가능해 end()전 바로 실행되기 때문에 문제없이 보내졌다.
module.exports = app;


// connection.end(); 커넥션.end을 마지막에 넣게되면 서버가 제대로 db에서 데이터를 받아오지 못한다. db를 받아오기전에 닫혀버리기때문.
// 따라서 각 요청별 db작업 후 따로 커넥션을 끊어줘야 서버도 제대로 수행되고 테스트시에도 커넥션이 안끊기고 계속 대기 되는 상황없이 테스트를 무사히 종료 시킬 수 있다.