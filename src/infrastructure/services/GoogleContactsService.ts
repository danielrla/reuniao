import { google, people_v1 } from 'googleapis';
import { GoogleCalendarCredentials } from './GoogleCalendarService';

export interface GoogleContactData {
    id?: string;
    names?: { givenName?: string; familyName?: string; }[];
    emailAddresses?: { value?: string; }[];
    phoneNumbers?: { value?: string; }[];
    organizations?: { name?: string; title?: string; }[];
}

export class GoogleContactsService {
    private getAuth(credentials: GoogleCalendarCredentials) {
        const oAuth2Client = new google.auth.OAuth2(
            credentials.clientId,
            credentials.clientSecret,
            'urn:ietf:wg:oauth:2.0:oob'
        );
        oAuth2Client.setCredentials({ refresh_token: credentials.refreshToken });
        return oAuth2Client;
    }

    private getPeople(credentials: GoogleCalendarCredentials) {
        const auth = this.getAuth(credentials);
        return google.people({ version: 'v1', auth });
    }

    public async createContact(credentials: GoogleCalendarCredentials, contactData: GoogleContactData): Promise<string> {
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
            return response.data.resourceName as string;
        } catch (error: any) {
            console.error('Error creating Google Contact:', error.message);
            throw new Error(`Google Contacts API Error: ${error.message}`);
        }
    }

    public async updateContact(credentials: GoogleCalendarCredentials, resourceName: string, contactData: GoogleContactData): Promise<void> {
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
        } catch (error: any) {
            console.error('Error updating Google Contact:', error.message);
            throw new Error(`Google Contacts API Error: ${error.message}`);
        }
    }

    public async deleteContact(credentials: GoogleCalendarCredentials, resourceName: string): Promise<void> {
        try {
            const people = this.getPeople(credentials);
            await people.people.deleteContact({
                resourceName
            });
        } catch (error: any) {
            console.error('Error deleting Google Contact:', error.message);
            throw new Error(`Google Contacts API Error: ${error.message}`);
        }
    }

    public async listContacts(credentials: GoogleCalendarCredentials): Promise<people_v1.Schema$Person[]> {
        try {
            const people = this.getPeople(credentials);
            const response = await people.people.connections.list({
                resourceName: 'people/me',
                personFields: 'names,emailAddresses,phoneNumbers,organizations',
                sortOrder: 'LAST_MODIFIED_DESCENDING',
                pageSize: 100
            });
            return response.data.connections || [];
        } catch (error: any) {
            console.error('Error listing Google Contacts:', error.message);
            throw new Error(`Google Contacts API Error: ${error.message}`);
        }
    }
}
