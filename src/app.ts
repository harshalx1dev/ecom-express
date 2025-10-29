import express, { NextFunction, Request, Response } from "express";
import cors from 'cors';
import { configDotenv } from 'dotenv';
import authRouter from "./routes/auth.routes";
import storeRouter from "./routes/store/store.routes";
import webhookRouter from "./routes/webhook.routes";

configDotenv();

// Express App
const app = express();

const origins = process.env.WHITELISTED_URLS?.split(';');

app.use(cors({
  origin: origins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true
}))

// JSON Body Parser
app.use(express.json());

// Auth Route
app.use('/api/auth', authRouter);

// Store Route
app.use('/api', storeRouter);

// Webhooks
app.use('/api/webhook', webhookRouter);

// 404 handler for unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Error-handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  return res.status(500).json({ status: 'error', message: 'Internal Server Error!', error: err });
});

// Server Listener
// app.listen(process.env.PORT, () => console.log(`Server up and running on PORT: ${process.env.PORT}\nhttp://localhost:5000/`))
export default app;