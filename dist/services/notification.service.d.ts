export declare const sendEmailReminder: (email: string, taskDescription: string, dueDate: Date) => Promise<boolean>;
export declare const sendWhatsAppReminder: (phone: string, taskDescription: string, dueDate: Date) => Promise<boolean>;
export declare const processRemindersDaily: () => Promise<{
    status: string;
}>;
//# sourceMappingURL=notification.service.d.ts.map