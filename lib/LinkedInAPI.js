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
   * @param apiHost
   * @param apiResource
   */
  constructor(client_id, client_secret, redirect_uri, apiHost = 'https://api.linkedin.com', apiResource = '/v2') {
    this.url = apiHost + apiResource;
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
    const scope_string = encodeURIComponent(scope.join(','));
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.client_id}&redirect_uri=${this.redirect_uri}&state=${state}&scope=${scope_string}`;
  }

  /**
   * Find Total Number of Connections
   *
   * @returns {Promise<Object>}
   */
  async getTotalConnectionsNumber() {
    const url = `${this.url}/connections?q=viewer&start=0&count=0`;
    return this.invoke('GET', url)
  }

  /**
   * Retrieve current member's profile
   *
   * @returns {Promise<Object>}
   */
  async getCurrentMemberProfile() {
    const url = `${this.url}/me`;
    return this.invoke('GET', url)
  }

  /**
   * Invokes the given rest URL endpoint with the given body and headers
   *
   * @param {string} method - The HTTP verb (i.e. GET/POST)
   * @param {string} url - The uri endpoint for the HTTP service
   * @param {object} headers - The HTTP headers (i.e. {'random-header-name': 'random-header-value', 'content-type': 'application/json'})
   * @param {object} body - The JSON data to POST if applicable, or null
   *
   * @returns {object} The body of the HTTP response
   */
  invoke(method, url, headers = { 'content-type': 'application/json' }, body = {}) {
    const options = this.generateOptions(method, url, headers, body);
    return new Promise((resolve, reject) => {
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
   *
   * @returns {object} The HttpOptions JSON object
   */
  generateOptions(method, url, headers, body) {
    const options = {
      url,
      method,
      headers,
    };
    if (body) options['body'] = JSON.stringify(body);
    return options;
  }
};
