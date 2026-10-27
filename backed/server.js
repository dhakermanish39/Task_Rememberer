require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const allowed = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, cb) => {
      // allow tools like Postman (no origin) and the listed frontends
      if (!origin || allowed.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok', service: 'Kanban API' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));