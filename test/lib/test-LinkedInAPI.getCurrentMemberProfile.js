'use strict';

const { expect } = require('chai');

const LinkedInAPI = require('../../lib/LinkedInAPI');
const linkedInAPI = new LinkedInAPI('client_id', 'client_secret', 'redirect_uri');

describe('test /lib/LinkedInAPI.js getCurrentMemberProfile()', () => {
  beforeEach(() => {});

  /**
   * Test getCurrentMemberProfile()
   */
  it('should call getCurrentMemberProfile() correctly', (done) => {
    linkedInAPI.getCurrentMemberProfile(['id', 'firstName', 'lastName'], 'access_token')
      .then(response => {
        console.log(response);
        done();
      })
      .catch(err => {
        console.log(err);
        done()
      });
  });
});