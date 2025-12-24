# 🚀 Deployment Checklist for SitiNet ISP Portal

## Pre-Deployment Steps

### 1. Generate Secure Secret Key
```python
# Run this in Python to generate a secure key
import secrets
print(secrets.token_hex(32))
```

### 2. Create Production .env File
```bash
# Copy example and edit
cp .env.example .env

# Edit .env with production values:
SECRET_KEY=<your-generated-secret-key>
ADMIN_DEFAULT_PASSWORD=<strong-password-here>
DATABASE_URL=sqlite:///instance/plans.db
FLASK_ENV=production
```

### 3. Update CORS Settings (Optional)
Edit `app/__init__.py`:
```python
# Replace wildcard with your domain
CORS(app, resources={r"/api/*": {"origins": "https://yourdomain.com"}})
```

### 4. Database Backup Strategy
```bash
# Backup database before deployment
cp instance/plans.db instance/plans.db.backup
```

## Deployment Options

### Option 1: Heroku (Easiest)
```bash
# Install Heroku CLI, then:
heroku create your-isp-portal
heroku config:set SECRET_KEY=your-secret-key
heroku config:set ADMIN_DEFAULT_PASSWORD=your-password
git push heroku main
```

### Option 2: Railway
```bash
# Install Railway CLI, then:
railway init
railway up
# Set environment variables in Railway dashboard
```

### Option 3: VPS (DigitalOcean, Linode, AWS EC2)
```bash
# On your server:
git clone <your-repo>
cd siti
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Create .env file with production values
nano .env

# Run with systemd or supervisor
waitress-serve --port=5000 app:app
```

### Option 4: Docker (Recommended for VPS)
Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["waitress-serve", "--port=5000", "--call", "app:create_app"]
```

Then:
```bash
docker build -t sitinet-isp .
docker run -p 5000:5000 --env-file .env sitinet-isp
```

## Post-Deployment Checklist

- [ ] Change default admin password immediately
- [ ] Test all features (plans, admin, forms)
- [ ] Verify HTTPS is working
- [ ] Set up database backups
- [ ] Configure domain DNS
- [ ] Test mobile responsiveness
- [ ] Monitor error logs
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)

## Production Recommendations

### Database Upgrade (For High Traffic)
Consider migrating to PostgreSQL:
```bash
# Install psycopg2
pip install psycopg2-binary

# Update DATABASE_URL
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### CDN for Static Assets
- Upload CSS/JS to Cloudflare CDN
- Update template URLs

### Monitoring & Logging
```bash
# Install Sentry for error tracking
pip install sentry-sdk[flask]
```

### SSL Certificate
- Use Let's Encrypt (free)
- Or Cloudflare SSL (free)

### Backup Automation
```bash
# Cron job for daily backups
0 2 * * * cp /path/to/instance/plans.db /backups/plans-$(date +\%Y\%m\%d).db
```

## Security Hardening

1. **Rate Limiting** - Add Flask-Limiter
2. **Input Validation** - Already has CSRF, add more validation
3. **HTTPS Only** - Force SSL in production
4. **Security Headers** - Add Flask-Talisman
5. **Regular Updates** - Keep dependencies updated

## Performance Optimization

1. **Enable Gzip** - Compress responses
2. **Cache Static Assets** - Set long cache headers
3. **Database Indexing** - Add indexes to frequently queried fields
4. **Connection Pooling** - For PostgreSQL

## Estimated Costs

- **Heroku**: $7/month (Hobby tier)
- **Railway**: $5/month (Starter)
- **DigitalOcean**: $6/month (Basic Droplet)
- **AWS EC2**: $3-10/month (t2.micro/t3.micro)
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)

## Support & Maintenance

- Monitor logs daily for first week
- Set up automated backups
- Plan for monthly dependency updates
- Have rollback strategy ready

---

**Your project is deployment-ready with these fixes!** 🎉
