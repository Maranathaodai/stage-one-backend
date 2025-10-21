require('dotenv').config();
const express = require('express');
const { connectDB } = require('./models/db');
const app = express();
const stringRoutes = require('./routes/stringRoutes');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

// Global error logging for unexpected issues
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

app.use(express.json());

app.get('/health', (req, res) => {
  console.log('Health check hit');
  res.json({ status: 'ok' });
});

app.use('/strings', stringRoutes);

// Swagger docs
const openapiPath = path.join(__dirname, 'docs', 'openapi.json');
if (fs.existsSync(openapiPath)) {
  const spec = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
  console.log('Swagger UI available at /docs');
}

// Try to bind to an available port (fall back if EACCES/EADDRINUSE)
async function startHttpServer() {
  const preferred = Number(process.env.PORT) || 5051;
  const candidates = [preferred, 5000, 3000, 0];

  for (const port of candidates) {
    try {
      await new Promise((resolve, reject) => {
        const server = app
          .listen(port, () => {
            const address = server.address();
            const actualPort = typeof address === 'object' && address ? address.port : port;
            console.log(`Server running on port ${actualPort}`);
            // Keep reference so we can handle server errors later
            server.on('error', (err) => {
              console.error('Server error (after start):', err);
            });
            resolve();
          })
          .on('error', (err) => {
            // Only try next port on common bind errors
            if (err && (err.code === 'EACCES' || err.code === 'EADDRINUSE')) {
              console.warn(`Port ${port} unavailable (${err.code}). Trying next...`);
              // Close server just in case
              try { server && server.close(); } catch {}
              reject(err);
            } else {
              reject(err);
            }
          });
      });
      // If we reached here, server started
      return;
    } catch (err) {
      // Continue to next candidate
      continue;
    }
  }

  throw new Error('Failed to bind to any port');
}

// Connect to DB before starting server
connectDB()
  .then(() => startHttpServer())
  .catch(err => {
    console.error('Startup failure:', err);
    process.exit(1);
  });
