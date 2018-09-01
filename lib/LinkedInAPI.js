'use strict';

const request = require('request');

/*
 * A class for interacting with LinkedIn through the exposed REST API.
 * The functionality exposed by this class is based on the LinkedIn documentation online
 * taken from the following site: https://developer.linkedin.com/docs/guide/v2
 */
module.exports = class LinkedInRestClient {

  /**
   * Class constructor
   *
   * @param client_id
   * @param client_secret
   * @param redirect_uri
   * @param api_host
   * @param api_resource
   * @param oauth_url
   */
  constructor(client_id, client_secret, redirect_uri, api_host = 'https://api.linkedin.com', api_resource = '/v2', oauth_url = 'https://www.linkedin.com/oauth/v2') {
    this.url = api_host + api_resource;
    this.oauth_url = oauth_url;
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.redirect_uri = redirect_uri;

    if (!this.client_id) throw new Error('Missing "client_id" during initialization!');
    if (!this.client_secret) throw new Error('Missing "client_secret" during initialization!');
    if (!this.redirect_uri) throw new Error('Missing "redirect_uri" during initialization!');
  }

  /**
   * Get authorization URL
   *
   * @param scope
   * @param state
   * @returns {string}
   */
  getAuthorizationUrl(scope, state) {
    if (!Array.isArray(scope)) throw new Error('Scope must be an array');
    const scope_string = encodeURIComponent(scope.join(','));
    return `${this.oauth_url}/authorization?response_type=code&client_id=${this.client_id}&redirect_uri=${this.redirect_uri}&state=${state}&scope=${scope_string}`;
  }

  /**
   * Get access token: https://developer.linkedin.com/docs/oauth2
   *
   * @param code
   * @param state
   * @returns {Promise<Object>}
   */
  async getAccessToken(code, state) {
    const url = `${this.oauth_url}/accessToken?grant_type=authorization_code&code=${code}&redirect_uri=${this.redirect_uri}&client_id=${this.client_id}&client_secret=${this.client_secret}`;
    return this.invoke('POST', url, { 'content-type': 'application/x-www-form-urlencoded' });
  }

  /**
   * Find Total Number of Connections
   *
   * @returns {Promise<Object>}
   */
  async getTotalConnectionsNumber(access_token) {
    if (!access_token) throw new Error('Access code cannot be empty');
    const url = `${this.url}/connections?q=viewer&start=0&count=0`;
    return this.invoke('GET', url, _, _, { withAuth: true, access_token });
  }

  /**
   * Retrieve current member's profile
   *
   * @returns {Promise<Object>}
   */
  async getCurrentMemberProfile(access_token) {
    if (!access_token) throw new Error('Access code cannot be empty');
    const url = `${this.url}/me`;
    return this.invoke('GET', url, _, _, { withAuth: true, access_token });
  }

  /**
   * Invokes the given rest URL endpoint with the given body and headers
   *
   * @param {string} method - The HTTP verb (i.e. GET/POST)
   * @param {string} url - The uri endpoint for the HTTP service
   * @param {object} headers - The HTTP headers (i.e. {'random-header-name': 'random-header-value', 'content-type': 'application/json'})
   * @param {object} body - The JSON data to POST if applicable, or null
   * @param {object} auth - An object to pass to make a call which requires authorization, example { withAuth: true, access_token: 'access_token' }
   *
   * @returns {object} The body of the HTTP response
   */
  invoke(method, url, headers = { 'content-type': 'application/json' }, body = {}, auth = { withAuth: false, access_token: null }) {
    return new Promise((resolve, reject) => {
      let options;
      try {
        options = this.generateOptions(method, url, headers, body, auth);
      } catch (err) {
        return reject(err);
      }
      request(options, (error, response, body) => {
        if(error) return reject(error);
        if(response.statusCode === 404) return resolve(null);
        if(response.statusCode !== 200 && response.statusCode !== 201) return reject(new Error(response.statusCode + ' ' + response.statusMessage + ': ' + JSON.stringify(body)));
        return resolve(body);
      });
    });
  }

  /**
   * Generates the required options for invoking HTTP/HTTPS requests
   *
   * @param {string} method - The HTTP verb (i.e. GET/POST)
   * @param {string} url - The uri endpoint for the HTTP service
   * @param {object} headers - The HTTP headers (i.e. {'random-header-name': 'random-header-value', 'content-type': 'application/json'})
   * @param {object} body - The JSON data to POST if applicable, or null
   * @param {object} auth - An object to pass to make a call which required authorization, example { withAuth: true, access_token: 'access_token' }
   *
   * @returns {object} The HttpOptions JSON object
   */
  generateOptions(method, url, headers, body, auth) {
    if (auth.withAuth) {
      if (!auth.access_token) throw new Error('Missing required "access_token" in the auth body');
      headers['Authorization'] = `Bearer ${auth.access_token}`;
    }
    const options = { url, method, headers };
    if (body) options['body'] = JSON.stringify(body);
    return options;
  }
};
