import 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import Server from '../server';

chai.use(chaiHttp);
chai.should();

import MailService from '../server/api/services/mail.service';
import { Mail } from '../server/api/controllers/mails/model';

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

  it("should return 422 if text is not supplied", (done) => {
    const mailWithoutSubject = {
      to: [{ name: 'User', email: 'email' }]
    }
    chai.request(Server)
      .post(`/${version}/mails`)
      .send(mailWithoutSubject)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.be.a('object');
        res.body.should.have.property('status').eql('Unprocessable Entity');
        res.body.should.have.property('error');
        res.body.error.should.include('text: Text is required.')
        done();
      });
  });


  it("should return 422 if email is invalid", (done) => {
    const mailWithoutSubject = {
      to: [{ name: 'User', email: 'email' }],
      from: { name: 'Name', email: 'invalidEmail' }
    }
    chai.request(Server)
      .post(`/${version}/mails`)
      .send(mailWithoutSubject)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.be.a('object');
        res.body.should.have.property('status').eql('Unprocessable Entity');
        res.body.should.have.property('error');
        res.body.error.should.include('text: Text is required.')
        res.body.error.should.include('from.email: Email should be a valid email address')
        done();
      });
  });

  it("should return 200 payload is correct", (done) => {
    const validEmailPayload = {
      from: { name: 'Name', email: 'user@mail.com' },
      subject: "This is subject of mail during test",
      text: "This is body of mail during test"
    }
    const serviceNames = ['SendGrid'];

    const expectedResponse = {
      status: 'RESPONSE_STATUS',
      description: 'RESPONSE_DESCRIPTION'
    }

    const mockedMailService = sinon.mock(MailService);
    mockedMailService.expects("sendMail")
      .once()
      .withExactArgs(new Mail(validEmailPayload), serviceNames)
      .returns(expectedResponse);

    chai.request(Server)
      .post(`/${version}/mails`)
      .send({...validEmailPayload, service_names: serviceNames})
      .end((err, res) => {

        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('payload').eql(expectedResponse);
        mockedMailService.verify();
        mockedMailService.restore();
        done();
      });
  });

  it("should return 400 payload if no service is configured", (done) => {
    const validEmailPayload = {
      from: { name: 'Name', email: 'user@mail.com' },
      subject: "This is subject of mail during test",
      text: "This is body of mail during test"
    }
    const serviceNames = ['SendGrid'];

    const mockedMailService = sinon.mock(MailService);
    mockedMailService.expects("sendMail")
      .once()
      .withExactArgs(new Mail(validEmailPayload), serviceNames)
      .throws(new Error('NO_EMAIL_CONFIGURED'));

    chai.request(Server)
      .post(`/${version}/mails`)
      .send({...validEmailPayload, service_names: serviceNames})
      .end((err, res) => {

        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('status').eql('Bad Request');
        mockedMailService.restore();
        mockedMailService.verify();
        done();
      });
  });

  it("should return 500 payload if unknown error occurs", (done) => {
    const validEmailPayload = {
      from: { name: 'Name', email: 'user@mail.com' },
      subject: "This is subject of mail during test",
      text: "This is body of mail during test"
    }
    const serviceNames = ['SendGrid'];

    const mockedMailService = sinon.mock(MailService);
    mockedMailService.expects("sendMail")
      .once()
      .withExactArgs(new Mail(validEmailPayload), serviceNames)
      .throws(new Error('BLA_BLA_ERROR'));

    chai.request(Server)
      .post(`/${version}/mails`)
      .send({...validEmailPayload, service_names: serviceNames})
      .end((err, res) => {

        res.should.have.status(500);
        res.body.should.be.a('object');
        res.body.should.have.property('status').eql('Server Error');
        mockedMailService.restore();
        mockedMailService.verify();
        done();
      });
  });

});