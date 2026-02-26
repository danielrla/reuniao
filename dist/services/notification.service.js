"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRemindersDaily = exports.sendWhatsAppReminder = exports.sendEmailReminder = void 0;
const sendEmailReminder = async (email, taskDescription, dueDate) => {
    // TODO: Integrate actual Email provider (e.g. SendGrid, Mailchimp)
    console.log(`[EMAIL COMPONENTE] Sending email to ${email} for task: "${taskDescription}" due at ${dueDate.toISOString()}`);
    return true;
};
exports.sendEmailReminder = sendEmailReminder;
const sendWhatsAppReminder = async (phone, taskDescription, dueDate) => {
    // TODO: Integrate actual Meta Cloud API or Twilio for WhatsApp
    console.log(`[WHATSAPP COMPONENTE] Sending WhatsApp to ${phone} for task: "${taskDescription}" due at ${dueDate.toISOString()}`);
    return true;
};
exports.sendWhatsAppReminder = sendWhatsAppReminder;
// This function represents the Cloud Scheduler / Cron Job trigger endpoint
const processRemindersDaily = async () => {
    console.log('Running daily reminder processor to find pending tasks near deadline...');
    // Logic to query Prisma for Tasks near expiration and call sendEmail/WhatsApp
    return { status: 'Reminders processed successfully' };
};
exports.processRemindersDaily = processRemindersDaily;
//# sourceMappingURL=notification.service.js.map