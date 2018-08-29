'use strict';

const chai = require('chai');
const expect = chai.expect;

const LinkedInAPI = require('../../lib/LinkedInAPI');

describe('test /lib/LinkedInAPI.js', () => {
  const linkedInAPI = new LinkedInAPI();

  it('should call getCurrentMemberProfile() correctly', (done) => {
    linkedInAPI.getCurrentMemberProfile()
      .then(response => {
        console.log(response);
        // expect(res.location.name).to.be.equal('Toronto');
        done();
      })
      .catch(err => {
        console.log(err);
        done(err)
      });
  });
});