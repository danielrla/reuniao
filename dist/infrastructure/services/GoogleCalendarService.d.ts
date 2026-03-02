import { calendar_v3 } from 'googleapis';
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
export declare class GoogleCalendarService {
    private getAuth;
    private getCalendar;
    private buildEventResource;
    createEvent(credentials: GoogleCalendarCredentials, event: GoogleEvent): Promise<string>;
    updateEvent(credentials: GoogleCalendarCredentials, eventId: string, event: GoogleEvent): Promise<void>;
    deleteEvent(credentials: GoogleCalendarCredentials, eventId: string): Promise<void>;
    listEvents(credentials: GoogleCalendarCredentials, timeMin?: Date, timeMax?: Date): Promise<calendar_v3.Schema$Event[]>;
}
//# sourceMappingURL=GoogleCalendarService.d.ts.map