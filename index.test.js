const app = require('./index');
const request = require('supertest');
const mysql = require('mysql');
const Pool = require('mysql/lib/Pool');
const { describe } = require('node:test');
const { send } = require('process');
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


    it('get/locations', (done) => {
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
          //end()는 jest에서 제공하는 테스트함수로, 비동기 함수가 끝날때 콜백함수를 실행할 수 있게 해준다. get요청의 응답이 도착하면 콜백함수 실행
          request(app).get("/locations").expect(200).end((err, res) => {
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
        pool.query("select turn, location_name, address, mapx, mapy from location", (error,results,fields) => {
          const row_data_packet = results[0]
          const result_object = JSON.parse(JSON.stringify(row_data_packet));//RowDataPacket을 js객체 형태로 바꾸기 위해 JSON.stringify()를 사용하여 JSON 문자열로 변환한 후, 다시 JSON.parse()를 사용하여 새로운 JavaScript 객체로 변환
          expect(result_object).toStrictEqual(post_datas);
        })
    });







    it('delete/location:id', (done) => {
      let delete_datas = {
        turn:3,
        location_name:"삭제name",
        address:"삭제주소",
        mapx:11,
        mapy:11
      };
      let datas = [
        delete_datas.turn, delete_datas.location_name, delete_datas.address, delete_datas.mapx, delete_datas.mapy
      ];
      pool.query("insert into location values(null,?,?,?,?,?,now(),now())",datas, (error, results, fields) => {
        let delete_id = results.insertId;
        request(app).delete(`/location${delete_id}`).expect(200).end((err, res) => {
          if (err) {
            console.log('request_error')
            done(err);
          } else {
            expect(res.status).toBe(200);
            pool.query("select turn from location where id = ?",delete_id, (error,results,fields) => {
              expect(results).toStrictEqual([]);
              done();
            })
          }
        })
      });
    })


    it('put/locations/turn', (done) => {
      let fst_datas = {
        turn:1,
        location_name:"삭제name",
        address:"삭제주소",
        mapx:11,
        mapy:11
      };
      let snd_datas = {
        turn:2,
        location_name:"삭제name",
        address:"삭제주소",
        mapx:11,
        mapy:11
      };
      let datas = [
        fst_datas.turn, fst_datas.location_name, fst_datas.address, fst_datas.mapx, fst_datas.mapy,
        snd_datas.turn, snd_datas.location_name, snd_datas.address, snd_datas.mapx, snd_datas.mapy
      ];
      pool.query("insert into location values(null,?,?,?,?,?,now(),now()),(null,?,?,?,?,?,now(),now())",datas, (error, results, fields) => {
        let insert_data = {
          fst_id:results.insertId,
          fst_turn:snd_datas.turn,
          snd_id:results.insertId+1,
          snd_turn:fst_datas.turn
        }
        request(app).put('/locations/turn').send(insert_data).expect(200).end((err, res) => {
          if (err) {
            console.log('put_error')
            done(err);
          } else {
            expect(res.status).toBe(200);
            pool.query("select id, turn from location", (error,results,fields) => {
              //첫번째 id의 turn 이 두번째 id의 turn과 바뀌었는지 확인
              expect(results[0].id).toBe(insert_data.fst_id);
              expect(results[0].turn).toBe(snd_datas.turn);
              expect(results[1].id).toBe(insert_data.snd_id);
              expect(results[1].turn).toBe(fst_datas.turn);
              done();
            })
          }
        })
      });

    })
  });


