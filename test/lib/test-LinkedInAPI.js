'use strict';

const chai = require('chai');
const expect = chai.expect;

const LinkedInAPI = require('../../lib/LinkedInAPI');
const linkedInAPI = new LinkedInAPI('client_id', 'client_secret', 'redirect_uri');

describe('test /lib/LinkedInAPI.js', () => {
  beforeEach(() => {});

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

  it('should call getAuthorizationUrl() correctly', () => {
    const url = linkedInAPI.getAuthorizationUrl(['r_basicprofile', 'r_basicprofile_2'], 'state');
    expect(typeof url === 'string').to.be.true;
    expect(url).to.be.equal('https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=client_id&redirect_uri=redirect_uri&state=state&scope=r_basicprofile%2Cr_basicprofile_2');
  });
});