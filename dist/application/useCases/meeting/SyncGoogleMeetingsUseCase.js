"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncGoogleMeetingsUseCase = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const GoogleCalendarService_1 = require("../../../infrastructure/services/GoogleCalendarService");
const AppError_1 = require("../../../domain/errors/AppError");
class SyncGoogleMeetingsUseCase {
    async execute(tenantId, userId) {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new AppError_1.NotFoundError('Usuário não encontrado.');
        }
        if (!user.googleClientId || !user.googleClientSecret || !user.googleRefreshToken) {
            // Se o usuário não tem integração ativa, só retornamos vazio.
            return { syncedCount: 0, message: 'Integração com Google Agenda não configurada.' };
        }
        const calendarService = new GoogleCalendarService_1.GoogleCalendarService();
        // Puxar eventos apenas do ano corrente (requisito do usuário)
        const currentYear = new Date().getFullYear();
        const timeMin = new Date(currentYear, 0, 1, 0, 0, 0); // 1 de Janeiro, 00:00:00
        const timeMax = new Date(currentYear, 11, 31, 23, 59, 59); // 31 de Dezembro, 23:59:59
        const events = await calendarService.listEvents({
            clientId: user.googleClientId,
            clientSecret: user.googleClientSecret,
            refreshToken: user.googleRefreshToken
        }, timeMin, timeMax);
        let syncedCount = 0;
        for (const event of events) {
            if (!event.id)
                continue;
            // Checa se o evento já existe na base
            const existingMeeting = await prisma_1.default.meeting.findFirst({
                where: {
                    googleEventId: event.id,
                    tenantId
                }
            });
            if (!existingMeeting) {
                // Tenta extrair começo e fim do payload do Google (que pode ser dateTime ou date, caso all-day event)
                const startStr = event.start?.dateTime || event.start?.date;
                const endStr = event.end?.dateTime || event.end?.date;
                if (!startStr)
                    continue; // Pula se não tiver data definida
                const startTime = new Date(startStr);
                const endTime = endStr ? new Date(endStr) : new Date(startTime.getTime() + 60 * 60 * 1000);
                // Trata all-day events pra não quebrar timestamp
                const isAllDay = !event.start?.dateTime;
                await prisma_1.default.meeting.create({
                    data: {
                        tenantId,
                        organizerId: userId,
                        title: event.summary || 'Reunião sem título (Google)',
                        description: event.description || null,
                        location: event.location || null,
                        date: startTime, // A data base será a data de início
                        startTime: isAllDay ? null : startTime,
                        endTime: isAllDay ? null : endTime,
                        status: 'MARCADA',
                        type: event.location && (event.location.includes('http') || event.location.includes('meet.google')) ? 'ONLINE' : 'IN_PERSON',
                        googleEventId: event.id,
                        // Se for um link do meet no location ou conferenceData, podemos capturar
                        meetingLink: event.htmlLink || null
                    }
                });
                syncedCount++;
            }
        }
        return { syncedCount, message: `Sincronização concluída. ${syncedCount} reuniões importadas.` };
    }
}
exports.SyncGoogleMeetingsUseCase = SyncGoogleMeetingsUseCase;
//# sourceMappingURL=SyncGoogleMeetingsUseCase.js.map