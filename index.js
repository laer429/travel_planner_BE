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

const conn = {
  host : process.env.db_host,
  port : process.env.db_port,
  user : process.env.db_user,
  password : process.env.db_password,
  database : process.env.db_database
};

const connection = mysql.createConnection(conn);

connection.connect();


//내 일정 부분에 일정 보여주기
app.get('/location', (req,res) => {
  connection.query('select id, turn, location_name, address, mapx, mapy from travel_planner.location order by turn',function(error,results,fields) {
    res.send(results);
    if (error) {
      console.log('db connection error');
      res.statusCode(500);
    }
  });
});

//search_api 에서 찾은 결과를 내 일정에 추가하기
app.post('/location', (req,res) => {
  const input = req.body;
  if(!input.turn || !input.location_name || !input.address || !input.mapx || !input.mapy) {
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
      console.log('db connection error');
      res.statusCode(500);
    }
    res.status(201);
    res.end();
  });
  }
});

//일정 삭제
app.delete('/location:id',(req,res) => {
  if (!req.params.id) {
    res.status(400);
    res.end();
  } else {
    let id = req.params.id;
    connection.query("delete from travel_planner.location where id = ?;",id, function (error, results, fields) {
      if (error) {
        console.log('db connection error');
        res.statusCode(500);
      }
      res.status(200);
      res.end();
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
  connection.query("update travel_planner.location set turn = ? where id = ?",fst_datas,function (error, results, fields) {
    if (error) {
      console.log('db connection error');
      res.status(500);
      res.end();
    }
    connection.query("update travel_planner.location set turn = ? where id = ?",snd_datas,function (error, results, fields) {
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

app.listen(port, '0.0.0.0', async () => {
  console.log('=========================================');
  console.log(`Application is running on port : ${port}`);
  console.log('=========================================');
});