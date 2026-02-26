"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGoogleCalendarEvent = exports.syncGoogleContacts = void 0;
const syncGoogleContacts = async (userId, oauthToken) => {
    try {
        // TODO: implement actual googleapis people API call
        /*
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: oauthToken });
        const service = google.people({version: 'v1', auth});
        const res = await service.people.connections.list({
          resourceName: 'people/me',
          personFields: 'names,emailAddresses,phoneNumbers',
        });
        console.log(res.data.connections);
        */
        console.log(`Simulating sync of Google Contacts for User: ${userId}`);
        return { success: true, message: 'Contacts synced successfully' };
    }
    catch (error) {
        console.error('Error syncing Google Contacts', error);
        throw error;
    }
};
exports.syncGoogleContacts = syncGoogleContacts;
const createGoogleCalendarEvent = async (userId, meetingData, oauthToken) => {
    // TODO: implement googleapis calendar API call
    console.log(`Simulating sync of Google Calendar for User: ${userId}`);
    return { success: true, eventId: 'mock-event-id' };
};
exports.createGoogleCalendarEvent = createGoogleCalendarEvent;
//# sourceMappingURL=google.service.js.map