'use strict';

const request = require('request');

/*
 * A class for interacting with LinkedIn through the exposed REST API.
 * The functionality exposed by this class is based on the LinkedIn documentation online
 * taken from the following site: https://developer.linkedin.com/docs/guide/v2
 */
module.exports = class LinkedInRestClient {

  /*
   * The class constructor
   * @param {Object}
   */
  constructor(settings, apiHost = 'https://api.linkedin.com', apiResource = '/v2') {
    this.url = apiHost + apiResource;
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
   * @param {string} method - The HTTP verb (i.e. GET/POST)
   * @param {string} url - The uri endpoint for the HTTP service
   * @param {object} headers - The HTTP headers (i.e. {'random-header-name': 'random-header-value', 'content-type': 'application/json'})
   * @param {object} body - The JSON data to POST if applicable, or null
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
