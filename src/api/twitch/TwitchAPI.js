const https = require('https');

/**
 * This class provides functionality for interacting with the Twitch API (specifically api.twitch.tv as other
 * functionality will be handled elsewhere). Each method is formatted as:
 *      {http method}{path}{additional info for differentiation}
 * For the sake of brevtiy, the API version is excluded, and this module will only support interacting with the current
 * (helix) version of the API.
 * For example. GET https://api.twitch.tv/helix/users would become getUsers(). API methods that accept parameters will
 * expose those as method parmeters
 */
class TwitchAPI {
    /**
     * Contructs a new instace of this API controller.
     *
     * @param {string} clientId The Client ID of the applicaiton using the API. Required for most API calls
     * @param {string} appToken The OAuth App Token for the applicaiton. Required for most API calls
     */
    constructor(clientId, appToken) {
        this.clientId = clientId;
        this.appToken = appToken;
    }

    /**
     * Searches for a single user by their internal ID
     *
     * @param {number} id The numerical ID of the user
     * @returns An object containing the data from the query
     */
    async getUsersById(id) {
        return this.getUsers(true, id);
    }

    /**
     * Searches for a single user by their login (username)
     * @param {string} username The login (username) of the user
     * @returns An object containing the data from the query
     */
    async getUsersByLogin(username) {
        return this.getUsers(false, username);
    }

    /**
     * Searches for a single user, either by id or login
     *
     * @param {boolean} id True if this search is being done by id
     * @param {string|number} value The value to search for
     * @returns A promise for an object containing the data from the query
     */
    getUsers(id, value) {
        const path = `helix/users?${id ? `id=${value}` : `login=${value}`}`;
        const getUserParams = {
            host: 'api.twitch.tv',
            path,
            method: 'GET',
            headers: {
                'Client-ID': this.clientId,
                Authorization: `Bearer ${this.appToken}`,
            },
        };
        return new Promise((resolve, reject) => {
            let responseData = '';
            const request = https.request(getUserParams, (result) => {
                result.setEncoding('utf8');
                result.on('data', (d) => {
                    responseData += d;
                }).on('end', () => {
                    const responseBody = JSON.parse(responseData);
                    resolve(responseBody);
                }).on('error', (e) => {
                    reject(e);
                });
            });
            request.end();
        });
    }
}

module.exports.TwitchAPI = TwitchAPI;
