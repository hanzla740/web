# 🇮🇳 Deploy to DigitalOcean Bangalore - Best for India

## Why DigitalOcean Bangalore?
- ✅ **Low Latency**: ~20ms for Indian users
- ✅ **Affordable**: ₹500/month for 1GB RAM
- ✅ **Reliable**: 99.99% uptime SLA
- ✅ **Easy Setup**: 10 minutes to deploy

## Step-by-Step Deployment

### 1. Create DigitalOcean Account
- Go to https://digitalocean.com/
- Sign up (get $200 credit for 60 days)
- Verify email and add payment method

### 2. Create Droplet (Server)
- Click "Create" → "Droplets"
- **Image**: Ubuntu 22.04 LTS
- **Plan**: Basic ($6/month = ₹500/month)
- **CPU**: Regular (1GB RAM, 1 vCPU)
- **Datacenter**: Bangalore (BLR1)
- **Authentication**: SSH Key (recommended) or Password
- **Hostname**: sitinet-isp
- Click "Create Droplet"

### 3. Connect to Server
```bash
# SSH into your server (replace IP with your droplet IP)
ssh root@your-droplet-ip

# Or use DigitalOcean Console in browser
```

### 4. Setup Server
```bash
# Update system
apt update && apt upgrade -y

# Install Python and Git
apt install python3 python3-pip python3-venv git nginx -y

# Clone your repository
git clone https://github.com/yourusername/siti.git
cd siti

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create production environment
cp .env.example .env
nano .env  # Edit with your values
```

### 5. Configure Environment
Edit `.env` file:
```bash
FLASK_ENV=production
SECRET_KEY=c9198c874adc5e163389d6ee30f1a0a342bc8054522ff384fac432ba5bb2fcd4
ADMIN_DEFAULT_PASSWORD=SecureAdmin2024!
DATABASE_URL=sqlite:///instance/plans.db
HOST=0.0.0.0
PORT=5000
ALLOWED_ORIGINS=https://yourdomain.com
```

### 6. Test Application
```bash
# Run application
python app.py

# Test in another terminal
curl http://localhost:5000
```

### 7. Setup Nginx (Web Server)
```bash
# Create Nginx config
nano /etc/nginx/sites-available/sitinet

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
ln -s /etc/nginx/sites-available/sitinet /etc/nginx/sites-enabled/
nginx -t  # Test configuration
systemctl reload nginx
```

### 8. Setup SSL Certificate (Free)
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 9. Setup Systemd Service (Auto-start)
```bash
# Create service file
nano /etc/systemd/system/sitinet.service

# Add this content:
[Unit]
Description=SitiNet ISP Portal
After=network.target

[Service]
User=root
WorkingDirectory=/root/siti
Environment=PATH=/root/siti/.venv/bin
ExecStart=/root/siti/.venv/bin/python app.py
Restart=always

[Install]
WantedBy=multi-user.target

# Enable and start service
systemctl daemon-reload
systemctl enable sitinet
systemctl start sitinet
systemctl status sitinet
```

### 10. Configure Domain (Optional)
- Point your domain's A record to your droplet IP
- Update ALLOWED_ORIGINS in .env with your domain
- Restart service: `systemctl restart sitinet`

## 💰 **Total Cost**
- **DigitalOcean Droplet**: ₹500/month
- **Domain**: ₹800/year (optional)
- **SSL Certificate**: Free (Let's Encrypt)
- **Total**: ~₹500/month

## 🔧 **Management Commands**
```bash
# View logs
journalctl -u sitinet -f

# Restart application
systemctl restart sitinet

# Update application
cd /root/siti
git pull
systemctl restart sitinet

# Backup database
cp instance/plans.db backups/plans-$(date +%Y%m%d).db
```

## 🌐 **Access Your Portal**
- **Customer Portal**: http://your-droplet-ip/ or https://yourdomain.com/
- **Admin Dashboard**: http://your-droplet-ip/admin
- **Default Login**: admin / SecureAdmin2024!

## 🆘 **Troubleshooting**
```bash
# Check if app is running
systemctl status sitinet

# Check logs
journalctl -u sitinet -n 50

# Check nginx
systemctl status nginx
nginx -t

# Check firewall
ufw status
ufw allow 80
ufw allow 443
ufw allow 22
```

This gives you a production-ready ISP portal with excellent performance for Indian users!