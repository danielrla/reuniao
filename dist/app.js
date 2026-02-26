"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./interface/middlewares/errorHandler");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev')); // TODO: integrate with GCP Cloud Logging in production
// Healthcheck route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Reuniao API is running' });
});
// App routes - Versioned
app.use('/api/v1', routes_1.default);
// Error Handling Middleware Global
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map