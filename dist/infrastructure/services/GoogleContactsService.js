"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleContactsService = void 0;
const googleapis_1 = require("googleapis");
class GoogleContactsService {
    getAuth(credentials) {
        const oAuth2Client = new googleapis_1.google.auth.OAuth2(credentials.clientId, credentials.clientSecret, 'urn:ietf:wg:oauth:2.0:oob');
        oAuth2Client.setCredentials({ refresh_token: credentials.refreshToken });
        return oAuth2Client;
    }
    getPeople(credentials) {
        const auth = this.getAuth(credentials);
        return googleapis_1.google.people({ version: 'v1', auth });
    }
    async createContact(credentials, contactData) {
        try {
            const people = this.getPeople(credentials);
            const response = await people.people.createContact({
                personFields: 'names,emailAddresses,phoneNumbers,organizations',
                requestBody: {
                    names: contactData.names,
                    emailAddresses: contactData.emailAddresses,
                    phoneNumbers: contactData.phoneNumbers,
                    organizations: contactData.organizations
                }
            });
            return response.data.resourceName;
        }
        catch (error) {
            console.error('Error creating Google Contact:', error.message);
            throw new Error(`Google Contacts API Error: ${error.message}`);
        }
    }
    async updateContact(credentials, resourceName, contactData) {
        try {
            const people = this.getPeople(credentials);
            // Get etag string
            const existing = await people.people.get({
                resourceName,
                personFields: 'names,emailAddresses,phoneNumbers,organizations'
            });
            await people.people.updateContact({
                resourceName,
                updatePersonFields: 'names,emailAddresses,phoneNumbers,organizations',
                requestBody: {
                    etag: existing.data.etag,
                    names: contactData.names,
                    emailAddresses: contactData.emailAddresses,
                    phoneNumbers: contactData.phoneNumbers,
                    organizations: contactData.organizations
                }
            });
        }
        catch (error) {
            console.error('Error updating Google Contact:', error.message);
            throw new Error(`Google Contacts API Error: ${error.message}`);
        }
    }
    async deleteContact(credentials, resourceName) {
        try {
            const people = this.getPeople(credentials);
            await people.people.deleteContact({
                resourceName
            });
        }
        catch (error) {
            console.error('Error deleting Google Contact:', error.message);
            throw new Error(`Google Contacts API Error: ${error.message}`);
        }
    }
    async listContacts(credentials) {
        try {
            const people = this.getPeople(credentials);
            const response = await people.people.connections.list({
                resourceName: 'people/me',
                personFields: 'names,emailAddresses,phoneNumbers,organizations',
                sortOrder: 'LAST_MODIFIED_DESCENDING',
                pageSize: 100
            });
            return response.data.connections || [];
        }
        catch (error) {
            console.error('Error listing Google Contacts:', error.message);
            throw new Error(`Google Contacts API Error: ${error.message}`);
        }
    }
}
exports.GoogleContactsService = GoogleContactsService;
//# sourceMappingURL=GoogleContactsService.js.map