import querystring from 'querystring';
import https from 'https';

/**
 * Represents the OAuth scheme utilized by the Twitch API. This serves as an abstraction between the bot programs and
 * whatever middleware may be used, along with the actual API interactions.
 */
class TwitchOAuth {
    clientId: string;
    clientSecret: string;

    constructor(clientId: string, clientSecret: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    /**
     * Determines if a token is valid
     * @param {string} token The OAuth token to check the validity of
     * @returns True if the token is valid
     */
    async isTokenValid(token: string): Promise<boolean> {
        return (await this.validateToken(token)).statusCode === 200;
    }

    /**
     * Checks the valdiity of an OAuth token
     *
     * @param {string} token The OAuth token to validate
     * @returns A promise for the data from the validation end point
     */
    // eslint-disable-next-line class-methods-use-this
    validateToken(token: string): Promise<{statusCode: number}> {
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

    // eslint-disable-next-line class-methods-use-this
    async doRequest(data: string, params: Record<string, unknown>): Promise<unknown> {
        return new Promise((resolve, reject) => {
            let responseData = '';
            const request = https.request(params, (result) => {
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
            request.write(data);
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
        return this.doRequest(accessTokenData, getAccessTokenParams);
    }

    async getAuthorizationCode(code: string): Promise<string> {
        const authCodeData = new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: 'http://localhost:3000',
        });
        const getAuthCodeParams = {
            host: 'id.twitch.tv',
            path: '/oauth2/token',
            method: 'POST',
        };
        const response = await this.doRequest(authCodeData.toString(), getAuthCodeParams);
        console.log(response);
        return '';
    }
}

module.exports.TwitchOAuth = TwitchOAuth;
