const app = require('./index');
const request = require('supertest');
const mysql = require('mysql');
// const { networkInterfaces } = require('os');
require('dotenv').config();


//질문: *데이터를 생성하고 비교한다.
//처음생성할때 테스트db에 생성하려면 index.js의 database 부분을 수정해야하는데 테스트를 위해 원래 파일을 수정하는게 맞는건가?

const conn = {
  host : process.env.db_host,
  port : process.env.db_port,
  user : process.env.db_user,
  password : process.env.db_password,
  database : process.env.db_database_test
};

const connection = mysql.createConnection(conn);

// beforeAll(() => {
//   const connection = mysql.createConnection(conn);
  
  // let get_datas = {
  //   turn:3,
  //   location_name:"location_name",
  //   address:"주소다",
  //   mapx:11,
  //   mapy:11
  // };

  
// });

describe("get/location", () => {

  it('test', async () => {
    let get_datas = {
      turn:3,
      location_name:"location_name",
      address:"주소다",
      mapx:11,
      mapy:11
    };
    let datas = [
      get_datas.turn, get_datas.location_name, get_datas.address, get_datas.mapx, get_datas.mapy
    ];
    connection.query(
      "insert into location values(null,?,?,?,?,?,now(),now())",
      datas,
      function (error, results, fields) {
        console.log('success db insert');
        connection.end();
      }
    );
    await request(app)
      .get("/location")
      .set("Accept", "application/json") // 헤더를 보낸다.
      .expect((res) => {
        console.log('res.body',res.body[res.body.length-1])
        delete res.body[res.body.length-1].id // id 값은 넣어줄때 임의로 넣어줄 수 없으므로 비교하려면 불러온값을 그대로 비교해주는 수밖에 없는데 이는 비교하지 않는것과 같으므로 비교하지 않기위해 res.body에 id값을 지우고 테스트를 진행함.
        expect(res.body[res.body.length-1]).toStrictEqual(get_datas)
        expect(res.status).toBe(200)
      });
  });
});

// describe("post/location", () => {
//   it("post/location", async () => {
//     let post_datas = {
//       turn:3,
//       location_name:"post_name",
//       address:"post",
//       mapx:11,
//       mapy:11
//     };
//     const res = await request(app)
//       .post("/location")
//       .set("Accept", "application/json")
//       .send(post_datas)
//       expect(res.status).toBe(201);
//       expect(res.body).toStrictEqual(post_datas);
//   })
// });

// xdescribe('DELETE /location/:id', () => {
//   it('delete/location', async () => {
//     let delete_datas = {
//       turn:3,
//       location_name:"삭제name",
//       address:"삭제주소",
//       mapx:11,
//       mapy:11
//     };
//     let datas = [
//       delete_datas.turn, delete_datas.location_name, delete_datas.address, delete_datas.mapx, delete_datas.mapy
//     ];
//     let delete_id = 1
//     connection.query("insert into location values(null,?,?,?,?,?,now(),now())",datas, function (error, results, fields) {
//       // delete_id = results
//       console.log('results',results);
//     });

//     const res = await request(app)
//       .delete(`/location/${delete_id}`)
//     expect(res.status).toBe(200);
//   })
// })


