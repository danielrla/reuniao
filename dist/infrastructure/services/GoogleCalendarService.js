"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarService = void 0;
const googleapis_1 = require("googleapis");
class GoogleCalendarService {
    getAuth(credentials) {
        const oAuth2Client = new googleapis_1.google.auth.OAuth2(credentials.clientId, credentials.clientSecret, 'urn:ietf:wg:oauth:2.0:oob' // Out of band or standard redirect if needed
        );
        oAuth2Client.setCredentials({ refresh_token: credentials.refreshToken });
        return oAuth2Client;
    }
    getCalendar(credentials) {
        const auth = this.getAuth(credentials);
        return googleapis_1.google.calendar({ version: 'v3', auth });
    }
    buildEventResource(event) {
        return {
            summary: event.title,
            description: event.description,
            location: event.location,
            start: {
                dateTime: event.startTime.toISOString(),
                timeZone: 'America/Sao_Paulo',
            },
            end: {
                dateTime: event.endTime.toISOString(),
                timeZone: 'America/Sao_Paulo',
            },
            attendees: event.attendees?.map(email => ({ email })),
            // To set a custom meet link, it usually requires GSuite, but we can put the link in the "location" or description
        };
    }
    async createEvent(credentials, event) {
        try {
            const calendar = this.getCalendar(credentials);
            const resource = this.buildEventResource(event);
            const response = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: resource,
                sendUpdates: 'all'
            });
            return response.data.id;
        }
        catch (error) {
            console.error('Error creating Google Calendar event:', error.message);
            throw new Error(`Google Calendar API Error: ${error.message}`);
        }
    }
    async updateEvent(credentials, eventId, event) {
        try {
            const calendar = this.getCalendar(credentials);
            const resource = this.buildEventResource(event);
            await calendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                requestBody: resource,
                sendUpdates: 'all'
            });
        }
        catch (error) {
            console.error('Error updating Google Calendar event:', error.message);
            throw new Error(`Google Calendar API Error: ${error.message}`);
        }
    }
    async deleteEvent(credentials, eventId) {
        try {
            const calendar = this.getCalendar(credentials);
            await calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
                sendUpdates: 'all'
            });
        }
        catch (error) {
            console.error('Error deleting Google Calendar event:', error.message);
            throw new Error(`Google Calendar API Error: ${error.message}`);
        }
    }
    async listEvents(credentials, timeMin, timeMax) {
        try {
            const calendar = this.getCalendar(credentials);
            const response = await calendar.events.list({
                calendarId: 'primary',
                timeMin: timeMin ? timeMin.toISOString() : (new Date()).toISOString(),
                timeMax: timeMax ? timeMax.toISOString() : undefined,
                maxResults: 2500, // Increased maxResults to accommodate a whole year
                singleEvents: true,
                orderBy: 'startTime',
                eventTypes: ['default'], // Somente reuniões/eventos padrão (ignorar focus time e OOO)
            });
            return response.data.items || [];
        }
        catch (error) {
            console.error('Error listing Google Calendar events:', error.message);
            throw new Error(`Google Calendar API Error: ${error.message}`);
        }
    }
}
exports.GoogleCalendarService = GoogleCalendarService;
//# sourceMappingURL=GoogleCalendarService.js.map