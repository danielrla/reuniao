import { google, calendar_v3 } from 'googleapis';

export interface GoogleCalendarCredentials {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
}

export interface GoogleEvent {
    id?: string;
    title: string;
    description?: string;
    location?: string;
    startTime: Date;
    endTime: Date;
    meetingLink?: string;
    attendees?: string[];
}

export class GoogleCalendarService {
    private getAuth(credentials: GoogleCalendarCredentials) {
        const oAuth2Client = new google.auth.OAuth2(
            credentials.clientId,
            credentials.clientSecret,
            'urn:ietf:wg:oauth:2.0:oob' // Out of band or standard redirect if needed
        );
        oAuth2Client.setCredentials({ refresh_token: credentials.refreshToken });
        return oAuth2Client;
    }

    private getCalendar(credentials: GoogleCalendarCredentials) {
        const auth = this.getAuth(credentials);
        return google.calendar({ version: 'v3', auth });
    }

    private buildEventResource(event: GoogleEvent): calendar_v3.Schema$Event {
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

    public async createEvent(credentials: GoogleCalendarCredentials, event: GoogleEvent): Promise<string> {
        try {
            const calendar = this.getCalendar(credentials);
            const resource = this.buildEventResource(event);

            const response = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: resource,
                sendUpdates: 'all'
            });

            return response.data.id as string;
        } catch (error: any) {
            console.error('Error creating Google Calendar event:', error.message);
            throw new Error(`Google Calendar API Error: ${error.message}`);
        }
    }

    public async updateEvent(credentials: GoogleCalendarCredentials, eventId: string, event: GoogleEvent): Promise<void> {
        try {
            const calendar = this.getCalendar(credentials);
            const resource = this.buildEventResource(event);

            await calendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                requestBody: resource,
                sendUpdates: 'all'
            });
        } catch (error: any) {
            console.error('Error updating Google Calendar event:', error.message);
            throw new Error(`Google Calendar API Error: ${error.message}`);
        }
    }

    public async deleteEvent(credentials: GoogleCalendarCredentials, eventId: string): Promise<void> {
        try {
            const calendar = this.getCalendar(credentials);
            await calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
                sendUpdates: 'all'
            });
        } catch (error: any) {
            console.error('Error deleting Google Calendar event:', error.message);
            throw new Error(`Google Calendar API Error: ${error.message}`);
        }
    }

    public async listEvents(credentials: GoogleCalendarCredentials, timeMin?: Date, timeMax?: Date): Promise<calendar_v3.Schema$Event[]> {
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
        } catch (error: any) {
            console.error('Error listing Google Calendar events:', error.message);
            throw new Error(`Google Calendar API Error: ${error.message}`);
        }
    }
}
