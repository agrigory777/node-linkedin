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
   * Retrieve current member's profile
   *
   * @param fields
   * @param access_token
   * @returns {Promise<Object>}
   */
  async getCurrentMemberProfile(fields, access_token) {
    if (!access_token) throw new Error('Access code cannot be empty');
    if (!Array.isArray(fields)) throw new Error('Parameter "fields" must be an array');
    const url = `${this.url}/me?projection=(${fields.join(',')})`;
    return this.invoke('GET', url, undefined, undefined, { withAuth: true, access_token });
  }
  
  /**
	 * Retrieve current member's email
	 *
	 * @param access_token
	 * @returns {Promise<Object>}
	 */
	async getCurrentMemberEmail(access_token) {
		if (!access_token) throw new Error('Access code cannot be empty');
		const url = `${this.url}/emailAddress?q=members&projection=(elements*(handle~))`;
		return this.invoke('GET', url, undefined, undefined, { withAuth: true, access_token });
	}



  /**
   * Find Total Number of Connections
   *
   * @returns {Promise<Object>}
   */
  async getTotalConnectionsNumber(access_token) {
    if (!access_token) throw new Error('Access code cannot be empty');
    const url = `${this.url}/connections?q=viewer&start=0&count=0`;
    return this.invoke('GET', url, undefined, undefined, { withAuth: true, access_token });
  }

  /**
   * Post Share From Account
   * @link https://developer.linkedin.com/docs/guide/v2/shares/share-api#post
   *
   * @param body
   * @param access_token
   * @returns {Promise<Object>}
   */
  async postShareFromAccount(body, access_token) {
    if (!access_token) throw new Error('Access code cannot be empty');
    const url = `${this.url}/shares`;
    return this.invoke('POST', url, undefined, body, { withAuth: true, access_token });
  }

  /**
   * Find Organizations for which the Authenticated User is Administrator
   *
   * @param access_token
   * @returns {Promise<Object>}
   */
  async getUserOrganizationsList(access_token) {
    if (!access_token) throw new Error('Access code cannot be empty');
    const url = `${this.url}/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED`;
    return this.invoke('GET', url, undefined, undefined, { withAuth: true, access_token });
  }

  /**
   * Find Organization Administrators
   * Find all users which have elevated access for a given organizational entity.
   * You may use either an organization URN or organizationBrand URN.
   *
   * @param organization_urn
   * @returns {Promise<Object>}
   */
  async getOrganizationAdmins(organization_urn) {
    if (!organization_urn) throw new Error('Parameter "organization_urn" cannot be empty');
    const url = `${this.url}/organizationalEntityAcls?q=organizationalTarget&organizationalTarget=${organization_urn}&role=ADMINISTRATOR&state=APPROVED`;
    return this.invoke('GET', url, undefined, undefined, { withAuth: false, access_token: null });
  }

  /**
   * Retrieve Share by share_id
   *
   * @param share_id
   * @param access_token
   * @returns {Promise<Object>}
   */
  async getShareById(share_id, access_token) {
    if (!share_id) throw new Error('Share_id cannot be empty');
    if (!access_token) throw new Error('Access code cannot be empty');
    const url = `${this.url}/shares/${share_id}`;
    return this.invoke('GET', url, undefined, undefined, { withAuth: true, access_token });
  }

  /**
   * Retrieve Shares by owner
   * @link https://developer.linkedin.com/docs/guide/v2/shares/share-api#retrieve
   *
   * @param type
   * @param id
   * @param start
   * @param count
   * @param shares_per_owner
   * @param access_token
   * @returns {Promise<Object>}
   */
  async getSharesByOwner(type, id, start = 0, count = 50, shares_per_owner = 1000, access_token = '') {
    if (!type) throw new Error('Parameter "type" cannot be empty');
    if (type !== 'organization' && type !== 'person') throw new Error('Parameter "type" must be "person" or "organization"');
    if (!id) throw new Error('Parameter "id" cannot be empty');
    if (!access_token) throw new Error('Access code cannot be empty');
    const urn = `urn:li:${type}:${id}`;
    const url = `${this.url}/shares?q=owners&owners=${urn}&start=${start}&count=${count}&sharesPerOwner=${shares_per_owner}`;
    return this.invoke('GET', url, undefined, undefined, { withAuth: true, access_token });
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
    const state_string = encodeURIComponent(state);
    const redirect_uri = encodeURIComponent(this.redirect_uri);
    return `${this.oauth_url}/authorization?response_type=code&client_id=${this.client_id}&redirect_uri=${redirect_uri}&state=${state_string}&scope=${scope_string}`;
  }

  /**
   * Get access token: https://developer.linkedin.com/docs/oauth2
   *
   * @param code
   * @param state
   * @returns {Promise<Object>}
   */
  async getAccessToken(code, state) {
    if (!code) throw new Error('Code parameter cannot be empty');
    const url = `${this.oauth_url}/accessToken?grant_type=authorization_code&code=${code}&redirect_uri=${this.redirect_uri}&client_id=${this.client_id}&client_secret=${this.client_secret}`;
    return this.invoke('POST', url, { 'content-type': 'application/x-www-form-urlencoded' });
  }

  /**
   * Invokes the given rest URL endpoint with the given body and headers
   *
   * @param {string} method - The HTTP verb (i.e. GET/POST)
   * @param {string} url - The uri endpoint for the HTTP service
   * @param {object} headers - The HTTP headers (i.e. {'random-header-name': 'random-header-value', 'content-type': 'application/json'})
   * @param {object} reqBody - The JSON data to POST if applicable, or null
   * @param {object} auth - An object to pass to make a call which requires authorization, example { withAuth: true, access_token: 'access_token' }
   *
   * @returns {object} The body of the HTTP response
   */
  invoke(method, url, headers = { 'Content-Type': 'Application/json' }, reqBody = {}, auth = { withAuth: false, access_token: null }) {
    return new Promise((resolve, reject) => {
      let options;
      try {
        options = this.generateOptions(method, url, headers, reqBody, auth);
      } catch (err) {
        return reject(err);
      }
      request(options, (error, response, body) => {
        if(error) return reject(error);
        if(response.statusCode === 404) return resolve(null);
        if(response.statusCode !== 200 && response.statusCode !== 201) return reject(new Error(response.statusCode + ' ' + response.statusMessage + ': ' + JSON.stringify(body)));
        try {
          const data = JSON.parse(body);
          return resolve(data);
        } catch (err) {
          return reject(err)
        }
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
    headers['X-Restli-Protocol-Version'] = '2.0.0';
    if (auth.withAuth) {
      if (!auth.access_token) throw new Error('Missing required "access_token" in the auth body');
      headers['Authorization'] = `Bearer ${auth.access_token}`;
    }
    const options = { url, method, headers };
    if (body) options['body'] = JSON.stringify(body);
    return options;
  }
};
