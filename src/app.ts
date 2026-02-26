import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';

import { errorHandler } from './interface/middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev')); // TODO: integrate with GCP Cloud Logging in production

// Healthcheck route
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'OK', message: 'Reuniao API is running' });
});

// App routes - Versioned
app.use('/api/v1', routes);

// Error Handling Middleware Global
app.use(errorHandler);

export default app;
