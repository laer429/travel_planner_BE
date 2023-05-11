const app = require('./index');
const request = require('supertest');
const mysql = require('mysql');
const Pool = require('mysql/lib/Pool');
require('dotenv').config();


const conn = {
  host : process.env.db_host,
  port : process.env.db_port,
  user : process.env.db_user,
  password : process.env.db_password,
  database : process.env.db_database_test
};

describe('e2e_Test', () => {
  let pool;


  beforeAll(() => {
    console.log('beforAll_test');
    pool = mysql.createPool(conn);
  });

  afterAll((done) => {
    console.log('afterAll_test');
    pool.end(done);
  });
  
  // 테스트전 db 초기화
  beforeEach((done) => {
    console.log('beforeEach')
    pool.query('delete from location',done);
  });

  describe("get/location", () => {
    it('get_test', (done) => {
      console.log('test')
      let get_datas = {
        turn:6,
        location_name:"tteesstt",
        address:"tteesst",
        mapx:22,
        mapy:22
      };
      let datas = [
        get_datas.turn, get_datas.location_name, get_datas.address, get_datas.mapx, get_datas.mapy
      ];
      pool.query("insert into location values(null,?,?,?,?,?,now(),now())",datas, (error, results, fields) => {
          console.log('success db insert');
          request(app).get("/location").expect(200).end((err, res) => {
            if (err) {
              done(err);
            } else {
              delete res.body[0].id
              expect(res.body[0]).toStrictEqual(get_datas)
              expect(res.status).toBe(200)
              done();
            }
          });
        }
      );
    });
  });  
  describe("post/location", () => {
    it("post/location", async () => {
      let post_datas = {
        turn:4,
        location_name:"post_name",
        address:"post",
        mapx:11,
        mapy:11
      };
      //post 요청 후 get 요청해 데이터 받아와 잘들어갔는지 post_datas와 비교
      const post_res = await request(app)
        .post("/location")
        .set("Accept", "application/json")
        .send(post_datas)
        expect(post_res.status).toBe(201);
      const res = await request(app)
        .get("/location")
        delete res.body[0].id
        expect(res.body[0]).toStrictEqual(post_datas)
        // expect(res.status).toBe(201);
    })
  });
})

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


