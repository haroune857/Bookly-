import express from 'express';
import dotenv from 'dotenv';
import { createApiRouter } from '../src/apiRouter';

dotenv.config({ override: true });

const app = express();
app.use(express.json({ limit: '15mb' }));

const apiRouter = createApiRouter();
// Mount both on '/api' and '/' to ensure compatibility whether Vercel rewrites preserve or strip the prefix
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
