---
description: Deploy Libris Ventures to a DigitalOcean Ubuntu droplet (Node.js + Nginx, no Docker)
---

# Deploy to DigitalOcean Ubuntu Droplet

> **Stack**: Ubuntu 24.04 · Node.js 22 LTS · Nginx reverse proxy · Let's Encrypt SSL · PM2 process manager
> **Domain**: librisventures.com (update if different)
> **Estimated time**: 30–40 minutes for first deploy, 2 minutes for redeployments

---

## Part 1 — Create the Droplet (DO Dashboard)

1. Log in to [DigitalOcean](https://cloud.digitalocean.com/)
2. **Create Droplet**:
   - **Region**: Frankfurt (FRA1) or Amsterdam (AMS3) — closest to EU for eIDAS
   - **Image**: Ubuntu 24.04 LTS
   - **Plan**: Basic $6/mo (1 vCPU, 1GB RAM, 25GB SSD) — sufficient for Next.js
   - **Authentication**: SSH key (recommended) or password
   - **Hostname**: `libris-ventures`
3. **Note the IP address** — you'll need it for:
   - DNS configuration
   - SK ID Solutions API registration
   - SSH access

---

## Part 2 — Point DNS to the Droplet

In your domain registrar (Namecheap, Cloudflare, etc.):

```
A    @              → <DROPLET_IP>
A    www            → <DROPLET_IP>
```

Wait for DNS propagation (usually 5–15 minutes).

---

## Part 3 — Server Setup (SSH into the Droplet)

### 3.1 Connect via SSH

```bash
ssh root@<DROPLET_IP>
```

### 3.2 System update + firewall

```bash
apt update && apt upgrade -y
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### 3.3 Install Node.js 22 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v  # should print v22.x
npm -v   # should print 10.x+
```

### 3.4 Install PM2 (process manager)

```bash
npm install -g pm2
```

### 3.5 Install Nginx

```bash
apt install -y nginx
systemctl enable nginx
```

### 3.6 Create app user (optional but recommended)

```bash
adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
```

---

## Part 4 — Deploy the Application

### 4.1 Create app directory

```bash
mkdir -p /var/www/libris-ventures
chown deploy:deploy /var/www/libris-ventures
```

### 4.2 Upload the project from your local machine

Run this from your **local machine** (PowerShell):

```powershell
# From the project root (LV2 folder)
scp -r .next package.json package-lock.json public node_modules root@<DROPLET_IP>:/var/www/libris-ventures/
```

Or using **rsync** (faster for redeployments):

```powershell
# Install rsync on Windows via Git Bash or WSL, then:
rsync -avz --exclude '.git' --exclude 'OLD_FULL_VERSION' --exclude 'extracted_archive' --exclude 'New version*' --exclude 'SOURCE_DOCS' .next package.json package-lock.json public node_modules root@<DROPLET_IP>:/var/www/libris-ventures/
```

> **Alternative: Build on server**
> If you prefer to build on the server (avoids uploading `node_modules`):
> ```bash
> # Upload source only
> scp -r . root@<DROPLET_IP>:/var/www/libris-ventures/
> cd /var/www/libris-ventures
> npm ci
> npm run build
> ```

### 4.3 Create .env.local on the server

```bash
nano /var/www/libris-ventures/.env.local
```

Add your environment variables:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Paddle (when ready)
# NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_token
# NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
# NEXT_PUBLIC_PADDLE_PRICE_ID=your_price_id

# eIDAS (when SK ID Solutions provides credentials)
# EIDAS_TSA_URL=https://tsa.sk.ee/...
# EIDAS_API_KEY=your_api_key
```

### 4.4 Start with PM2

```bash
cd /var/www/libris-ventures
pm2 start npm --name "libris" -- start
pm2 save
pm2 startup  # follow the printed command to enable auto-start on reboot
```

Verify it's running:

```bash
pm2 status
curl http://localhost:3000  # should return HTML
```

---

## Part 5 — Nginx Reverse Proxy

### 5.1 Create Nginx config

```bash
nano /etc/nginx/sites-available/libris-ventures
```

Paste:

```nginx
server {
    listen 80;
    server_name librisventures.com www.librisventures.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.2 Enable the site

```bash
ln -s /etc/nginx/sites-available/libris-ventures /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # remove default site
nginx -t  # test config
systemctl reload nginx
```

### 5.3 Test HTTP

Visit `http://librisventures.com` — you should see the site (no SSL yet).

---

## Part 6 — SSL with Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d librisventures.com -d www.librisventures.com
```

Follow the prompts (enter email, agree to terms). Certbot auto-configures Nginx for HTTPS.

Verify auto-renewal:

```bash
certbot renew --dry-run
```

Visit `https://libris.ventures` — should load with a valid SSL certificate 🔒

---

## Part 7 — Quick Redeployment

After making changes locally, redeploy in 2 steps:

### From your local machine:

```powershell
# 1. Build locally
npm run build

# 2. Upload the build
scp -r .next root@<DROPLET_IP>:/var/www/libris-ventures/
```

### On the server (SSH):

```bash
# 3. Restart the app
pm2 restart libris
```

### One-liner redeploy (from local PowerShell):

```powershell
npm run build; scp -r .next root@<DROPLET_IP>:/var/www/libris-ventures/; ssh root@<DROPLET_IP> "pm2 restart libris"
```

---

## Troubleshooting

| Issue | Check |
|-------|-------|
| 502 Bad Gateway | `pm2 status` — is the app running? Check `pm2 logs libris` |
| Site not loading | `nginx -t` then `systemctl status nginx` |
| SSL not working | `certbot renew` and check DNS A records |
| Port 3000 in use | `lsof -i :3000` and kill the old process |
| Out of memory | Monitor with `free -m`; consider upgrading to $12/mo droplet |
| App crashes on startup | Check `.env.local` is present and correct; `pm2 logs libris --lines 50` |

---

## Server Info (fill in after setup)

```
Droplet IP:    ___________________
Domain:        libris.ventures
Node version:  22.x
PM2 app name:  libris
Nginx config:  /etc/nginx/sites-available/libris-ventures
App directory: /var/www/libris-ventures
SSL:           Let's Encrypt (auto-renew)
```
