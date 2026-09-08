import express from 'express';
import dotenv from 'dotenv';
import { createApiRouter } from '../src/apiRouter';

dotenv.config({ override: true });

const app = express();

// Enable CORS for all origins (needed for Vercel preview and custom domains)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: '15mb' }));

const apiRouter = createApiRouter();

// Normalize URL path so routes match whether Vercel rewrites preserve /api or strip it
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    // Strip leading '/api' so /api/health becomes /health
    req.url = req.url.slice(4);
  } else if (req.url === '/api') {
    req.url = '/';
  }
  next();
});

// Root ping endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Bookly Studio Vercel API',
    time: new Date().toISOString()
  });
});

// Mount the API router
app.use('/', apiRouter);
app.use('/api', apiRouter);

// Global fallback error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[API Error]:', err);
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Erreur interne du serveur API',
      message: err?.message || String(err)
    });
  }
});

// Export handler function for Vercel Serverless
export default function handler(req: any, res: any) {
  return app(req, res);
}

export { app };
