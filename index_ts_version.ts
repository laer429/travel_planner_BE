import * as dotenv from "dotenv";
import mysql from 'mysql';
import cors from 'cors';
import express, {Express, Request, Response} from 'express';
import bodyParser from 'body-parser';

const app: Express = express();
dotenv.config();

const port: number = 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
const conn : {
    [key :string] : string,
} = {
  host : process.env.db_host,
  port : process.env.db_port,
  user : process.env.db_user,
  password : process.env.db_password,
  database : process.env.db_database
};

const connection = mysql.createConnection(conn);

connection.connect();
console.log('db success, port:'+port);

app.get('/', () => {
    return 'hello world';
});


// 내 일정 부분에 일정 보여주기
app.get('/location', (req: Request, res: Response) => {
  connection.query('select id, turn, location_name, address, mapx, mapy from travel_planner.location order by turn',function(error,results,fields) {
    res.send(results);
    if (error) {
      console.log('db connection error');
      res.status(500);
      res.end();
    }
  });
});

//search_api 에서 찾은 결과를 내 일정에 추가하기
app.post('/location', (req: Request, res: Response) => {
  if(!req.body.turn || !req.body.location_name || !req.body.address || !req.body.mapx || !req.body.mapy) {
    res.status(400);
    res.end();
  } else {
    let datas :(number|string)[] = [
      req.body.turn,
      req.body.location_name,
      req.body.address,
      req.body.mapx,
      req.body.mapy
  ];
  connection.query("insert into location values(null,?,?,?,?,?,now(),now())",datas, function (error, results, fields) {
      if (error) {
        console.log('db connection error');
        res.status(500);
        res.end();
      }
    res.status(201);
    res.end();
  });
  }
});

//일정 삭제
app.delete('/location:id',(req: Request, res: Response) => {
  if (!req.params.id) {
    res.status(400);
    res.end();
  } else {
    let id : string = req.params.id;
  connection.query("delete from travel_planner.location where id = ?;",id, function (error, results, fields) {
    res.status(200);
    res.end();
    if (error) {
      console.log('db connection error');
      res.status(500);
      res.end();
    }
  });
  }
});

//일정 순서 바꾸기
app.put('/location', (req: Request, res: Response) => {
  let fst_datas : string[] = [
      req.body.fst_turn,
      req.body.fst_id
  ];
  let snd_datas : string[] = [
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