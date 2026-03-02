import { people_v1 } from 'googleapis';
import { GoogleCalendarCredentials } from './GoogleCalendarService';
export interface GoogleContactData {
    id?: string;
    names?: {
        givenName?: string;
        familyName?: string;
    }[];
    emailAddresses?: {
        value?: string;
    }[];
    phoneNumbers?: {
        value?: string;
    }[];
    organizations?: {
        name?: string;
        title?: string;
    }[];
}
export declare class GoogleContactsService {
    private getAuth;
    private getPeople;
    createContact(credentials: GoogleCalendarCredentials, contactData: GoogleContactData): Promise<string>;
    updateContact(credentials: GoogleCalendarCredentials, resourceName: string, contactData: GoogleContactData): Promise<void>;
    deleteContact(credentials: GoogleCalendarCredentials, resourceName: string): Promise<void>;
    listContacts(credentials: GoogleCalendarCredentials): Promise<people_v1.Schema$Person[]>;
}
//# sourceMappingURL=GoogleContactsService.d.ts.map