import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { NodeSSH } from 'node-ssh';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store execution history (in production, use a real database)
let executionHistory = [];

// Initialize SSH connection
async function executeHardening(config) {
  const ssh = new NodeSSH();
  
  try {
    await ssh.connect({
      host: config.host,
      username: config.username,
      privateKey: config.privateKeyPath,
      port: config.port || 22,
    });

    // Read hardening script
    const scriptPath = path.join(__dirname, 'scripts', 'zero_trust_harden.sh');
    const script = fs.readFileSync(scriptPath, 'utf-8');

    // Execute the hardening script
    const result = await ssh.execCommand(`bash -s`, {
      stdin: script,
    });

    return {
      success: result.code === 0,
      stdout: result.stdout,
      stderr: result.stderr,
      code: result.code,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  } finally {
    ssh.dispose();
  }
}

// API Routes

// Get dashboard data
app.get('/api/dashboard', (req, res) => {
  res.json({
    projectName: 'AZTIH',
    version: '1.0.0',
    status: 'operational',
    lastExecution: executionHistory.length > 0 ? executionHistory[0] : null,
    totalExecutions: executionHistory.length,
  });
});

// Get servers configuration (placeholder)
app.get('/api/servers', (req, res) => {
  const serverConfig = {
    host: process.env.TARGET_SERVER_HOST || 'example.com',
    username: process.env.TARGET_SERVER_USER || 'ubuntu',
    port: process.env.TARGET_SERVER_PORT || 22,
  };
  res.json({
    servers: [
      {
        id: 1,
        name: process.env.TARGET_SERVER_NAME || 'Production Server',
        host: serverConfig.host,
        username: serverConfig.username,
        port: serverConfig.port,
        status: 'connected',
      },
    ],
  });
});

// Trigger hardening execution
app.post('/api/execute', async (req, res) => {
  const { serverId } = req.body;

  const config = {
    host: process.env.TARGET_SERVER_HOST,
    username: process.env.TARGET_SERVER_USER,
    privateKeyPath: process.env.TARGET_SERVER_SSH_KEY,
    port: process.env.TARGET_SERVER_PORT || 22,
  };

  if (!config.host || !config.username || !config.privateKeyPath) {
    return res.status(400).json({
      error: 'Server configuration incomplete. Check .env file.',
    });
  }

  try {
    res.json({ message: 'Hardening execution started...' });
    
    const result = await executeHardening(config);
    const execution = {
      id: executionHistory.length + 1,
      timestamp: new Date().toISOString(),
      serverId,
      result,
    };
    
    executionHistory.unshift(execution);
    
    // Keep only last 50 executions in memory
    if (executionHistory.length > 50) {
      executionHistory = executionHistory.slice(0, 50);
    }
  } catch (error) {
    console.error('Execution error:', error);
  }
});

// Get execution history
app.get('/api/history', (req, res) => {
  res.json({
    executions: executionHistory.slice(0, 20),
    total: executionHistory.length,
  });
});

// Get specific execution details
app.get('/api/history/:id', (req, res) => {
  const execution = executionHistory.find(e => e.id === parseInt(req.params.id));
  if (!execution) {
    return res.status(404).json({ error: 'Execution not found' });
  }
  res.json(execution);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 AZTIH Dashboard running on http://localhost:${PORT}`);
});
