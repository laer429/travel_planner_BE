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
        turn:5,
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
})
