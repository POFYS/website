import http from 'http';
import { exec } from 'child_process';
import crypto from 'crypto';

const PORT = process.env.WEBHOOK_PORT || 9000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const REBUILD_COMMAND = process.env.REBUILD_COMMAND;

function verifySignature(payload, signature) {
  if (!signature) return true;
  
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest('hex');
  return signature === digest;
}

const server = http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  if (req.url === '/webhook/strapi' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const signature = req.headers['x-strapi-signature'];

        if (signature && !verifySignature(body, signature)) {
          console.error('Invalid webhook signature');
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid signature' }));
          return;
        }

        const payload = JSON.parse(body);
        console.log(`[${new Date().toISOString()}] Webhook received:`, payload.event || 'unknown event');

        exec(REBUILD_COMMAND, (error, stdout, stderr) => {
          if (error) {
            console.error(`Rebuild error: ${error.message}`);
            console.error(`stderr: ${stderr}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Rebuild failed', details: error.message }));
            return;
          }

          console.log(`Rebuild output: ${stdout}`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Rebuild triggered',
            timestamp: new Date().toISOString()
          }));
        });

      } catch (error) {
        console.error('Error processing webhook:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });

    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook/strapi`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
