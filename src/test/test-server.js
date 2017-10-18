const chai     = require('chai'),
      chaiHttp = require('chai-http');

const { app } = require('../server');

const should = chai.should();
chai.use(chaiHttp);

describe('API', function () {

    it('should return success status code', () => {
        return chai.request(app)
            .get('/crypto')
            .then(res => {
                res.should.have.status(200);
            });
    });
}); 