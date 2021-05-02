const querystring = require('querystring');
const https = require('https');

/**
 * Represents the OAuth scheme utilized by the Twitch API. This serves as an abstraction between the bot programs and
 * whatever middleware may be used, along with the actual API interactions.
 */
class TwitchOAuth {
    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    /**
     * Determines if a token is valid
     * @param {string} token The OAuth token to check the validity of
     * @returns True if the token is valid
     */
    async isTokenValid(token) {
        return (await this.validateToken(token)).statusCode === 200;
    }

    /**
     * Checks the valdiity of an OAuth token
     *
     * @param {string} token The OAuth token to validate
     * @returns A promise for the data from the validation end point
     */
    // eslint-disable-next-line class-methods-use-this
    validateToken(token) {
        const validateParams = {
            host: 'id.twitch.tv',
            path: '/oauth2/validate',
            headers: {
                Authorization: `OAuth ${token}`,
            },
        };
        return new Promise((resolve, reject) => {
            let responseData = '';
            const request = https.request(validateParams, (result) => {
                result.on('data', (d) => {
                    responseData += d;
                }).on('end', () => {
                    const responseBody = JSON.parse(responseData);
                    responseBody.statusCode = result.statusCode;
                    resolve(responseBody);
                }).on('error', (e) => {
                    reject(e);
                });
            });
            request.end();
        });
    }

    /**
     * Generates an App Access Token for accessing resources the application owns, and are not user specific.
     * This token is used for many API calls, including EventSub
     *
     * @returns A promise for the object containing the credential data
     */
    async getAppAccessToken() {
        const accessTokenData = querystring.stringify({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'client_credentials',
        });
        const getAccessTokenParams = {
            host: 'id.twitch.tv',
            path: '/oauth2/token',
            method: 'POST',
        };
        return new Promise((resolve, reject) => {
            let responseData = '';
            const request = https.request(getAccessTokenParams, (result) => {
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
            request.write(accessTokenData);
            request.end();
        });
    }
}

module.exports.TwitchOAuth = TwitchOAuth;
