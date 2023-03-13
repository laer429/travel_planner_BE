const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

const conn = {
  host : '127.0.0.1',
  port : '3306',
  user : 'root',
  password : '',
  database : 'travel_planner'
};

const connection = mysql.createConnection(conn);

connection.connect();
console.log('db success');

app.get('/', (req, res) => {
  connection.query('select * from travel_planner.direction',function(error,results,fields) {
    res.send(results);
  })
});


app.listen(3000)