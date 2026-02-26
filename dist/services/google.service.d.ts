export declare const syncGoogleContacts: (userId: string, oauthToken: string) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const createGoogleCalendarEvent: (userId: string, meetingData: any, oauthToken: string) => Promise<{
    success: boolean;
    eventId: string;
}>;
//# sourceMappingURL=google.service.d.ts.map