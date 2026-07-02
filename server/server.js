const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const glossaryRoutes = require('./src/routes/glossaryRoutes');
const translateRoutes = require('./src/routes/translateRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/glossary', glossaryRoutes);
app.use('/api/glossaries', glossaryRoutes);
app.use('/api/translate', translateRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Translation Workspace API is running' });
});

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other process or set PORT to a different value.`);
    } else {
      console.error('Server failed to start:', error);
    }
    process.exit(1);
  });
};

startServer();

