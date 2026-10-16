
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import placesRouter from './routes/places.js';
import { pool } from './database/pool.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());


app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Helsinguide API is running',
  });
});

// Проверяем подключение к PostgreSQL
app.get('/api/health/db', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS time');
    res.json({
      status: 'ok',
      database: 'connected',
      time: result.rows[0].time,
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
    });
  }
});

app.use('/api/places', placesRouter);


app.listen(PORT, () => {
  console.log(`Helsinguide API running at http://localhost:${PORT}`);
});
