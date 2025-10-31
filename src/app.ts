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

// app.use((req, res, next) => {
//   const origin = req.headers.origin;

//   if (origins && origins.includes(origin || '')) {
//     res.header("Access-Control-Allow-Origin", origin);
//   }

//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-requested-with");

//   if (req.method === "OPTIONS") {
//     return res.status(200).end();
//   }

//   next();
// });

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (origins && origins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS blocked: " + origin));
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true
}))

app.options(/.*/, cors());

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