#!/bin/bash
# Autonomous Zero-Trust Hardening Script
# Target: Ubuntu/Debian based systems
# Run as root

set -e

echo "============================================="
echo " Initiating Zero-Trust Server Hardening... "
echo "============================================="

# 1. Update and Upgrade Packages
echo "[*] Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y ufw fail2ban auditd audispd-plugins libpam-google-authenticator

# 2. Secure SSH Configuration
echo "[*] Hardening SSH..."
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
sed -i 's/^#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#X11Forwarding.*/X11Forwarding no/' /etc/ssh/sshd_config
sed -i 's/^#MaxAuthTries.*/MaxAuthTries 3/' /etc/ssh/sshd_config
systemctl restart ssh || systemctl restart sshd

# 3. Configure UFW (Uncomplicated Firewall)
echo "[*] Configuring Firewall (Default Deny)..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
# Add your application ports here (e.g., ufw allow 443/tcp)
ufw --force enable

# 4. Fail2Ban Configuration
echo "[*] Setting up Fail2Ban..."
cat <<EOF > /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF
systemctl restart fail2ban
systemctl enable fail2ban

# 5. Kernel Hardening via sysctl
echo "[*] Applying Kernel Hardening Parameters..."
cat <<EOF > /etc/sysctl.d/99-security.conf
# Ignore ICMP broadcast requests
net.ipv4.icmp_echo_ignore_broadcasts = 1
# Disable IPv6 (if not used in infrastructure)
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
net.ipv6.conf.lo.disable_ipv6 = 1
# Enable TCP SYN Cookie Protection
net.ipv4.tcp_syncookies = 1
# Disable IP source routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
EOF
sysctl -p /etc/sysctl.d/99-security.conf

# 6. Auditing & Logging
echo "[*] Enabling Auditing..."
systemctl enable auditd
systemctl start auditd
# Audit user modifications
auditctl -w /etc/passwd -p wa -k identity
auditctl -w /etc/shadow -p wa -k identity

echo "============================================="
echo " Zero-Trust Baseline Applied Successfully! "
echo " Next Steps: Integrate with n8n and OpenClaw."
echo "============================================="
