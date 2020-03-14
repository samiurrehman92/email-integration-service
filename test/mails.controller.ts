import 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import Server from '../server';

chai.use(chaiHttp);
chai.should();

const version: string = 'v1';

describe("Testing API Service", () => {
  describe("GET /", () => {
    it("should return 200", (done) => {
      chai.request(Server)
        .get(`/`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});

describe('Test Mail Service', () => {

  it("should return 404 on GET of mails", (done) => {
    chai.request(Server)
      .get(`/${version}/mails`)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});