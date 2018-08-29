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
  constructor(settings, apiResource = '/api/v4') {
    this.url = settings.url + apiResource;
  }

  /*
   * Retrieves LinkedIn
   */
  async getCompanies(id){}

  /**
   * Invokes the given rest URL endpoint with the given body and headers
   *
   * @param {string} method - The HTTP verb (i.e. GET/POST)
   * @param {string} url - The uri endpoint for the HTTP service
   * @param {object} headers - The HTTP headers (i.e. {'random-header-name': 'random-header-value', 'content-type': 'application/json'})
   * @param {object} postJsonData - The JSON data to POST if applicable, or null
   * @returns {object} The body of the HTTP response
   */
  Invoke(method, url, headers, postJsonData){
    let options = this.GenerateOptions(method, url, headers, postJsonData);
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
   * @param {object} postJsonData - The JSON data to POST if applicable, or null
   * @returns {object} The HttpOptions JSON object
   */
  GenerateOptions(method, url, headers, postJsonData) {
    let options = {
      'url': url,
      'method': method,
      'headers': {},
    };
    if (headers) options[ 'headers' ] = headers;
    options[ 'headers' ][ 'Private-Token' ] = this.settings.token;
    if (postJsonData) options[ 'json' ] = postJsonData;
    return options;
  }
};
