// API Base URL
const API_BASE = '/api';

// DOM Elements
const executeBtnEl = document.getElementById('execute-btn');
const refreshBtnEl = document.getElementById('refresh-btn');
const serversListEl = document.getElementById('servers-list');
const historyListEl = document.getElementById('history-list');
const logsOutputEl = document.getElementById('logs-output');
const statusIndicatorEl = document.getElementById('status-indicator');
const statusTextEl = document.getElementById('status-text');
const modalEl = document.getElementById('modal');
const modalBodyEl = document.getElementById('modal-body');
const closeModalBtn = document.querySelector('.close');

// State
let currentExecution = null;
let refreshInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    loadServers();
    loadHistory();
    
    // Event listeners
    executeBtnEl.addEventListener('click', executeHardening);
    refreshBtnEl.addEventListener('click', () => {
        loadDashboard();
        loadHistory();
    });
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modalEl) closeModal();
    });

    // Auto-refresh every 30 seconds
    refreshInterval = setInterval(() => {
        loadHistory();
        loadDashboard();
    }, 30000);
});

// Load dashboard data
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/dashboard`);
        const data = await response.json();

        document.getElementById('total-executions').textContent = data.totalExecutions;
        document.getElementById('last-execution').textContent = data.lastExecution 
            ? new Date(data.lastExecution.timestamp).toLocaleString()
            : 'Never';
        document.getElementById('system-status').textContent = data.status;

        updateStatusIndicator(true);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        updateStatusIndicator(false);
    }
}

// Load servers
async function loadServers() {
    try {
        const response = await fetch(`${API_BASE}/servers`);
        const data = await response.json();

        serversListEl.innerHTML = data.servers.map(server => `
            <div class="server-card">
                <h3>${server.name}</h3>
                <p><strong>Host:</strong> ${server.host}</p>
                <p><strong>User:</strong> ${server.username}</p>
                <p><strong>Port:</strong> ${server.port}</p>
                <div class="server-status">
                    <span class="status-badge ${server.status}">${server.status}</span>
                </div>
                <button class="btn btn-small" onclick="executeHardeningForServer(${server.id})">
                    Harden This Server
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading servers:', error);
        serversListEl.innerHTML = '<p class="error">Failed to load servers</p>';
    }
}

// Load execution history
async function loadHistory() {
    try {
        const response = await fetch(`${API_BASE}/history`);
        const data = await response.json();

        if (data.executions.length === 0) {
            historyListEl.innerHTML = '<p class="placeholder">No executions yet</p>';
            return;
        }

        historyListEl.innerHTML = data.executions.map(exec => `
            <div class="history-item" onclick="showExecutionDetails(${exec.id})">
                <div class="history-timestamp">
                    ${new Date(exec.timestamp).toLocaleString()}
                </div>
                <div class="history-status">
                    <span class="status-badge ${exec.result.success ? 'success' : 'error'}">
                        ${exec.result.success ? '✓ Success' : '✗ Failed'}
                    </span>
                </div>
                <div class="history-details">
                    ${exec.result.code ? `Exit Code: ${exec.result.code}` : 'Execution Details'}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading history:', error);
        historyListEl.innerHTML = '<p class="error">Failed to load history</p>';
    }
}

// Execute hardening
async function executeHardening() {
    executeBtnEl.disabled = true;
    executeBtnEl.textContent = '⏳ Running...';
    logsOutputEl.textContent = 'Starting hardening execution...\n';

    try {
        const response = await fetch(`${API_BASE}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serverId: 1 })
        });

        const data = await response.json();
        logsOutputEl.textContent += `\n${data.message}\n`;

        // Refresh after 2 seconds to get updated results
        setTimeout(() => {
            loadHistory();
            loadDashboard();
        }, 2000);
    } catch (error) {
        logsOutputEl.textContent += `\nError: ${error.message}\n`;
        console.error('Execution error:', error);
    } finally {
        executeBtnEl.disabled = false;
        executeBtnEl.textContent = '▶ Execute Hardening Now';
    }
}

// Execute hardening for specific server
async function executeHardeningForServer(serverId) {
    executeBtnEl.disabled = true;
    executeBtnEl.textContent = '⏳ Running...';

    try {
        const response = await fetch(`${API_BASE}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serverId })
        });

        const data = await response.json();
        logsOutputEl.textContent = data.message + '\n';

        setTimeout(() => {
            loadHistory();
            loadDashboard();
        }, 2000);
    } catch (error) {
        alert('Error executing hardening: ' + error.message);
    } finally {
        executeBtnEl.disabled = false;
        executeBtnEl.textContent = '▶ Execute Hardening Now';
    }
}

// Show execution details in modal
async function showExecutionDetails(executionId) {
    try {
        const response = await fetch(`${API_BASE}/history/${executionId}`);
        const execution = await response.json();

        modalBodyEl.innerHTML = `
            <div class="execution-details">
                <p><strong>Timestamp:</strong> ${new Date(execution.timestamp).toLocaleString()}</p>
                <p><strong>Status:</strong> <span class="status-badge ${execution.result.success ? 'success' : 'error'}">
                    ${execution.result.success ? 'Success' : 'Failed'}
                </span></p>
                <p><strong>Exit Code:</strong> ${execution.result.code || 'N/A'}</p>
                
                ${execution.result.stdout ? `
                    <h3>Output</h3>
                    <pre class="log-output">${escapeHtml(execution.result.stdout)}</pre>
                ` : ''}
                
                ${execution.result.stderr ? `
                    <h3>Errors</h3>
                    <pre class="log-output error">${escapeHtml(execution.result.stderr)}</pre>
                ` : ''}
                
                ${execution.result.error ? `
                    <h3>Error</h3>
                    <pre class="log-output error">${escapeHtml(execution.result.error)}</pre>
                ` : ''}
            </div>
        `;
        
        modalEl.style.display = 'block';
    } catch (error) {
        console.error('Error loading execution details:', error);
        alert('Failed to load execution details');
    }
}

// Close modal
function closeModal() {
    modalEl.style.display = 'none';
}

// Update status indicator
function updateStatusIndicator(online) {
    if (online) {
        statusIndicatorEl.classList.remove('offline');
        statusIndicatorEl.classList.add('online');
        statusTextEl.textContent = 'Online';
    } else {
        statusIndicatorEl.classList.remove('online');
        statusIndicatorEl.classList.add('offline');
        statusTextEl.textContent = 'Offline';
    }
}

// Utility: Escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (refreshInterval) clearInterval(refreshInterval);
});
