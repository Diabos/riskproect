# AZTIH - Zero-Trust Infrastructure Hardening Dashboard

A modern web dashboard for executing and monitoring zero-trust infrastructure hardening on Linux servers.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-18+-green)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Ready-brightgreen)

## 🎯 What AZTIH Does

Execute server hardening and monitor security compliance from a beautiful web dashboard.

**Core Features:**
- ✅ One-click hardening execution on target Linux servers
- ✅ Real-time execution logs and status
- ✅ Multi-server management dashboard
- ✅ Execution history with detailed reports
- ✅ SSH-based remote execution (no agents needed)
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Zero external API dependencies

---

## 🚀 Deployment: GitHub Pages + Backend

Your dashboard deploys FREE to GitHub's domain: `https://YOUR-USERNAME.github.io/riskproect`

### Step 1: Deploy Frontend to GitHub Pages (FREE)

**Push to GitHub:**
```bash
git add .
git commit -m "AZTIH Dashboard"
git push origin main
```

**Enable GitHub Pages:**
1. Go to repo **Settings** → **Pages**
2. Select **Deploy from a branch**
3. Choose **gh-pages** branch
4. Save

✅ Your dashboard is now live!

---

### Step 2: Deploy Backend (Choose One)

The backend runs separately and connects to your target Linux servers via SSH.

#### 🐳 Option A: Docker (Recommended)

Deploy to any VPS, home server, or cloud provider that supports Docker.

```bash
# Install Docker
# https://docs.docker.com/engine/install/

# Configure
cp .env.example .env
# Edit .env with your server details

# Run
docker-compose up -d
```

Backend runs at: `http://your-vps-ip:3000`

#### ☁️ Option B: Heroku (Free Tier)

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set TARGET_SERVER_HOST=your-server.com
heroku config:set TARGET_SERVER_USER=ubuntu
heroku config:set TARGET_SERVER_SSH_KEY="$(cat ~/.ssh/id_rsa)"

# Deploy
git push heroku main
```

Backend runs at: `https://your-app-name.herokuapp.com`

#### 🚂 Option C: Railway (Fast Deploy)

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repo
3. Set environment variables in dashboard
4. Auto-deploys on push

#### 🖥️ Option D: Local Machine

For testing only:

```bash
npm install
npm run dev
```

Runs at: `http://localhost:3000`

---

### ⚙️ Configure Frontend to Connect to Backend

**For GitHub Pages (or any remote frontend):**

1. Edit `public/index.html` line 76-78
2. Uncomment and set your backend URL:

```html
<script>
    window.API_BASE = 'https://your-backend-url.com';
</script>
```

Examples:
- Heroku: `window.API_BASE = 'https://your-app-name.herokuapp.com';`
- Railway: `window.API_BASE = 'https://your-project.railway.app';`
- Docker VPS: `window.API_BASE = 'https://your-vps-ip:3000';`
- Local: Leave commented (uses `/api`)

3. Push to GitHub:
```bash
git add public/index.html
git commit -m "Configure backend endpoint"
git push origin main
```

---

## 🚀 Key Features

1. **SSH-Based Execution** - Remotely execute hardening scripts via SSH
2. **Dashboard UI** - Beautiful, responsive interface for all devices
3. **Multi-Server Support** - Manage multiple Linux servers from one place
4. **Execution History** - Full audit trail of every hardening run
5. **Real-Time Logs** - Watch hardening progress in real-time
6. **Zero Dependencies** - No agents or external services needed
7. **GitHub Pages Ready** - Deploy frontend for free

---

## 📋 Configuration

Edit `.env` file with your server details:

```env
# Target server to harden
TARGET_SERVER_HOST=your-server.com
TARGET_SERVER_USER=ubuntu
TARGET_SERVER_SSH_KEY=/path/to/private/key
TARGET_SERVER_PORT=22
TARGET_SERVER_NAME=Production Server

# Dashboard port (for local development)
PORT=3000
NODE_ENV=production
```

**SSH Key Setup:**
```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -f ~/.ssh/id_rsa

# Add public key to target server
ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@your-server.com

# Test connection
ssh ubuntu@your-server.com "echo 'Connected!'"
```

---

## 🏗️ Architecture

```
GitHub Pages (FREE)
↓
Dashboard UI (HTML/CSS/JS)
↓
Your Backend Server
↓ (SSH Tunnel)
↓
Linux Servers to Harden
```

---

## 📊 Core Functionality

### 1. Hardening Execution

Click **"Execute Hardening Now"** to run the hardening script on your target server.

**What Gets Hardened:**

```bash
✅ SSH Security
   - Disable root login
   - Enforce key-based authentication
   - Change default port (optional)
   - Disable password authentication

✅ Firewall (UFW)
   - Default deny all incoming traffic
   - Allow only necessary ports
   - Rate limiting enabled

✅ Brute-Force Protection (Fail2Ban)
   - Monitor SSH login attempts
   - Auto-ban IPs after failed attempts
   - Permanent blocks for repeat offenders

✅ Audit Logging (auditd)
   - Record all system calls
   - Track file access
   - Monitor user activity

✅ Kernel Hardening
   - SYN flood protection
   - ASLR (Address Space Layout Randomization)
   - Restrict kernel module loading
   - Disable IP forwarding

✅ File Permissions
   - Secure sudoers file
   - Protect SSH configs
   - Lock down sensitive logs
```

### 2. Server Management

Add multiple servers to your dashboard. Each can be hardened independently.

**Supported:**
- Ubuntu 20.04+
- Debian 10+
- Any systemd-based Linux

### 3. Execution History

Every hardening run is logged with:
- Timestamp
- Success/failure status
- Full command output
- Error messages

### 4. Status Monitoring

Real-time health checks show:
- Server connection status
- Last execution time
- System uptime

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start backend
npm run dev
# Runs at http://localhost:3000

# Edit files in public/ folder
# Changes auto-reload
```

**Project Structure:**
```
.
├── server.js                 # Express backend
├── public/
│   ├── index.html           # Dashboard UI
│   ├── app.js               # Frontend logic
│   └── styles.css           # Styling
├── scripts/
│   └── zero_trust_harden.sh  # Hardening script
├── .github/
│   └── workflows/
│       ├── deploy.yml       # GitHub Pages deploy
│       └── docker.yml       # Docker build
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔐 Security Best Practices

1. **Never commit .env to Git**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Protect SSH Keys**
   - Store privately
   - Use SSH agent
   - Never hardcode in code

3. **HTTPS Only**
   - Deploy behind HTTPS proxy
   - Use Let's Encrypt for free SSL
   - Update API endpoint to HTTPS

4. **Test in Staging**
   - Always test on non-production first
   - Review logs before running
   - Keep configuration backups

5. **Monitor Logs**
   ```bash
   tail -f /var/log/auth.log
   tail -f /var/log/audit/audit.log
   ```

---

## 🌐 API Endpoints

Used by dashboard:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/dashboard` | GET | Dashboard stats |
| `/api/servers` | GET | List servers |
| `/api/execute` | POST | Execute hardening |
| `/api/history` | GET | Execution history |
| `/api/history/:id` | GET | Execution details |
| `/api/health` | GET | Health check |

---

## 📱 Responsive Design

Works on:
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

---

## 🤝 Contributing

Found a bug? Have ideas? Open an issue!

---

## 📄 License

MIT License - Free for personal and commercial use

---

## 💡 Quick Summary

1. **Push to GitHub:** `git push origin main`
2. **Enable GitHub Pages:** Settings → Pages → gh-pages
3. **Deploy Backend:** Docker or Heroku
4. **Configure:** Edit `.env` with server details
5. **Start:** Visit `https://username.github.io/riskproect`

---

**AZTIH v1.0.0** | Security-First Infrastructure | GitHub Pages Ready
