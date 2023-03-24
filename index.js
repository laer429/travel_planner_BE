const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

const conn = {
  host : '127.0.0.1',
  port : '3306',
  user : 'root',
  password : process.env.db_password,
  database : 'travel_planner'
};

const connection = mysql.createConnection(conn);

connection.connect();
console.log('db success');

//내 일정 부분에 일정 보여주기
app.get('/', (req, res) => {
    connection.query('select * from travel_planner.location',function(error,results,fields) {
  res.send(results);
    console.log(results);
  })
});

//search_api 에서 찾은 결과를 내 일정에 추가하기
app.post('/add', (req,res) => {
  let datas = [
      req.body.turn,
      req.body.location_name,
      req.body.address,
      req.body.mapx,
      req.body.mapy
  ];
  connection.query("insert into location values(null,?,?,?,?,?,now(),now())",datas, function (error, results, fields) {
      // if (error) throw error;
  //     res.redirect('http://localhost:3000/list');
  res.send('post complete')
  });
});

app.delete('/:id',(req,res) => {
  let id = req.params.id;
  connection.query("delete from travel_planner.location where id = ?;",id, function (error, results, fields) {
    if (error) throw error;
    res.send('delete complete');
  });
});

app.put('/', (req,res) => {
  let datas = [
      req.body.turn,
      req.body.location_name,
      req.body.address,
      req.body.mapx,
      req.body.mapy,
      req.body.id
  ];
  let sda = [

  ]
  console.log('data:',datas)
  connection.query("update travel_planner.location set turn = ?, location_name = ?, address = ?, mapx = ?, mpay = ? where id = ?",datas,function (error, results, fields) {
      if (error) throw error;
  res.send('post complete')
  });
})

app.listen(3000)