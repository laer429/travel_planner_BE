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


// 파일이 직접 실행될 때 : db_database, else : db_database_test
const db_database = !module.parent ? process.env.db_database : process.env.db_database_test
const conn = {
  host : process.env.db_host,
  port : process.env.db_port,
  user : process.env.db_user,
  password : process.env.db_password,
  database : db_database
};

const connection = mysql.createConnection(conn);
connection.connect();
//내 일정 부분에 일정 보여주기
app.get('/location', (req,res) => {
  connection.query('select id, turn, location_name, address, mapx, mapy from location order by turn',function(error,results,fields) {
    if (error) {
      console.log('db connection error');
      res.status(500).end();
    }
    res.status(200).send(results);
  });
});

//search_api 에서 찾은 결과를 내 일정에 추가하기
app.post('/location', (req,res) => {
  const input = req.body;
  if(!input.turn || !input.location_name || !input.address || !input.mapx || !input.mapy) {
    res.status(400).end();
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
      console.log('db connection error');
      res.status(500).end();
    }
    res.status(201).end();
  });
  }
});

//일정 삭제
app.delete('/location:id',(req,res) => {
  if (!req.params.id) {
    res.status(400).end();
  } else {
    let id = req.params.id;
    connection.query("delete from location where id = ?;",id, function (error, results, fields) {
      if (error) {
        console.log('db connection error');
        res.status(500).end();
      }
      res.status(200).end();
    });
  }
});

//일정 순서 바꾸기
app.put('/location', (req,res) => {
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
      res.status(500).end();
    }
    connection.query("update location set turn = ? where id = ?",snd_datas,function (error, results, fields) {
      if (error) {
        console.log('db connection error');
        res.status(500).end();
      }
      res.status(200).end();
  });
  });

});


//Node.js 모듈 시스템에서는, 모듈을 불러오는 require() 함수를 사용하여 다른 모듈을 가져올 수 있습니다. 이때, 불러온 모듈은 자체적인 스코프를 가지며, 이 스코프 내에서 전역 변수가 아닌 변수는 모두 지역 변수로 취급됩니다.
//module.parent 변수는 현재 모듈을 불러온 부모 모듈을 가리키므로, module.parent === null 일 경우 현재 모듈이 직접 실행되었다는 것을 의미한다. 이를 이용하여, 다른 모듈에서 현재 모듈이 직접 실행되었는지, 아니면 다른 모듈에서 불러와서 사용되었는지를 구분할 수 있다.
// 직접 실행될때만 실행됨
if (!module.parent) {
  app.listen(port, '0.0.0.0', async () => {
    console.log('=========================================');
    console.log(`Application is running on port : ${port}`);
    console.log('=========================================');
  });
}

module.exports = app;

