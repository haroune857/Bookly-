import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { createApiRouter } from './src/apiRouter';

dotenv.config({ override: true });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Shared API Router for all AI, payments and studio routes
  const apiRouter = createApiRouter();
  app.use('/api', apiRouter);

  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection at server:', reason);
  });
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception in server:', err);
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bookly Studio running on http://0.0.0.0:${PORT} with Groq Llama 3.3 70B & Gemini`);
  });

  const gracefulShutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

startServer();
