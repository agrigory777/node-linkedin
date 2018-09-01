'use strict';

const { expect } = require('chai');

const LinkedInAPI = require('../../lib/LinkedInAPI');
const linkedInAPI = new LinkedInAPI('client_id', 'client_secret', 'redirect_uri');

describe('test /lib/LinkedInAPI.js generateOptions()', () => {
  beforeEach(() => {});

  /**
   * Test generateOptions()
   */
  it('should call generateOptions() correctly - all options provided', () => {
    const headers = { 'Content-Type': 'Application/json' };
    const body = { 'payload': 'some_payload' };
    const auth = { withAuth: true, access_token: 'some_token' };
    const options = linkedInAPI.generateOptions('POST', 'some_url', headers, body, auth);
    console.log(options);

    expect(typeof options === 'object').to.be.true;
    expect(options).to.have.keys(['method', 'url', 'headers', 'body']);

    expect(options.url).to.be.equal('some_url');
    expect(options.method).to.be.equal('POST');
    expect(options.headers['Content-Type']).to.be.equal('Application/json');
    expect(options.headers['Authorization']).to.be.equal('Bearer some_token');
    expect(JSON.parse(options.body).payload).to.be.equal('some_payload');
  });
});