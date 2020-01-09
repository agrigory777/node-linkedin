'use strict';

const { expect } = require('chai');

const LinkedInAPI = require('../../lib/LinkedInAPI');
const linkedInAPI = new LinkedInAPI('client_id', 'client_secret', 'redirect_uri');

describe('test /lib/LinkedInAPI.js getAuthorizationUrl()', () => {
  beforeEach(() => {});

  /**
   * Test getAuthorizationUrl()
   */
  it('should call getAuthorizationUrl() correctly', () => {
    const url = linkedInAPI.getAuthorizationUrl(['r_basicprofile', 'r_basicprofile_2'], 'state');
    expect(typeof url === 'string').to.be.true;
    expect(url).to.be.equal('https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=client_id&redirect_uri=redirect_uri&state=state&scope=r_basicprofile%2Cr_basicprofile_2');
  });

  it('should call getAuthorizationUrl() and throw error if 1st argument is not an array', () => {
    try {
      linkedInAPI.getAuthorizationUrl('r_basicprofile,r_basicprofile_2', 'state');
    } catch (err) {
      expect(err.message).to.be.equal('Scope must be an array');
    }
  });
});
