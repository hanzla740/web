# 🚀 Quick Start Guide - SitiNet ISP Portal

## Start the Server

```powershell
.\.venv\Scripts\python.exe run.py
```

## Access Points

- **Customer Site:** http://127.0.0.1:5000/
- **Admin Portal:** http://127.0.0.1:5000/admin
- **Default Login:** admin / admin123

## First-Time Setup (5 Minutes)

### 1. Login to Admin
- Go to http://127.0.0.1:5000/admin
- Username: `admin`
- Password: `admin123`

### 2. Update Branding
**Homepage Settings → Branding & Logo:**
- Company Name: Your ISP name
- Company Tagline: Your slogan
- Logo URL: Upload logo to Imgur/Cloudinary, paste URL
- Footer Tagline: Your footer message

### 3. Set Contact Info
**Homepage Settings → Contact Information:**
- Support Phone: +91 XXXXXXXXXX
- Support Email: support@yourisp.com
- WhatsApp Number: +91XXXXXXXXXX (with country code)

### 4. Update Location
**Homepage Settings → Current Location:**
- Enter your city name (e.g., "Mumbai", "Delhi")

### 5. Create Promo Banner
**Homepage Settings → Promotional Banner:**
- Banner Text: "🎉 Limited Offer: Get 3 months FREE!"
- Check "Show promotional banner"

### 6. Add Social Media
**Homepage Settings → Social Media:**
- Facebook URL: https://facebook.com/yourpage
- Twitter URL: https://twitter.com/yourhandle
- Instagram URL: https://instagram.com/yourhandle

### 7. Configure Tools
**Homepage Settings → Tools & Features:**
- ✅ Show speed test tool
- ✅ Show coverage checker

### 8. Save Settings
Click "Save page settings" button

## Managing Plans

### Create New Plan
1. Go to Admin → Plans section
2. Fill in plan details:
   - Name: "Fiber 100 Mbps"
   - Description: "Perfect for streaming"
   - Price: 999
   - Billing Cycle: "Monthly"
   - Type: Recharge or Installation
   - Check "Mark as popular" for featured plans
3. Click "Save plan"

### Edit Existing Plan
1. Click "Edit" button on any plan
2. Modify details
3. Click "Save plan"

### Delete Plan
1. Click "Delete" button
2. Confirm deletion

## Managing Customer Inquiries

### View Inquiries
- Admin Dashboard → Customer Inquiries section
- See statistics: Pending / Contacted / Converted

### Update Status
1. Find inquiry in list
2. Click status dropdown
3. Select new status (Pending/Contacted/Converted)
4. Auto-saves immediately

### Delete Inquiry
1. Click "Delete" button
2. Confirm deletion

## Testing the Site

### Test Customer Flow
1. Visit http://127.0.0.1:5000/
2. Click "Browse Plans"
3. Click "Select plan" on any plan
4. Fill inquiry form
5. Submit and check admin panel

### Test Mobile View
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device
4. Test hamburger menu
5. Test WhatsApp button

### Test Coverage Checker
1. Scroll to "Check your connection" section
2. Enter PIN code: 110001 (available)
3. Try: 999999 (not available)

## Common Tasks

### Change Password
1. Admin Panel → Change Your Password section
2. Enter current password
3. Enter new password twice
4. Click "Update password"

### Add Another Admin
1. Admin Panel → Add Another Admin section
2. Enter username and password
3. Click "Create admin"

### Update Hero Section
1. Admin Panel → Homepage Settings → Hero Section
2. Edit title and subtitle
3. Update statistics
4. Save settings

### Enable/Disable Promo Banner
1. Admin Panel → Homepage Settings → Promotional Banner
2. Uncheck "Show promotional banner" to hide
3. Save settings

## Mobile Features

### Hamburger Menu
- Appears automatically on mobile devices
- Click ☰ icon to open
- Click links to navigate (auto-closes)
- Click outside to close

### WhatsApp Button
- Floating button bottom-right
- Click to open WhatsApp chat
- Works on mobile and desktop

## Tips & Tricks

### Logo Upload
1. Use transparent PNG (200x200px recommended)
2. Upload to Imgur.com (free, no account needed)
3. Right-click image → Copy image address
4. Paste in Logo URL field

### Promo Banner Ideas
- "🎉 New Year Offer: 50% OFF first month!"
- "⚡ Upgrade to 1 Gbps - Limited slots!"
- "🎁 Refer a friend, get 1 month FREE!"
- "🔥 Flash Sale: 3 months at ₹999 only!"

### Coverage Checker
- Currently uses mock data
- Edit `static/js/main.js` to add real PIN codes
- Replace with API call for production

### Speed Test
- Links to fast.com (Netflix's speed test)
- Can change to speedtest.net or custom tool
- Edit link in `templates/index.html`

## Troubleshooting

### Server Won't Start
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /F /PID [process_id]

# Restart server
.\.venv\Scripts\python.exe run.py
```

### Database Issues
```powershell
# Reinitialize database
.\.venv\Scripts\python.exe -c "from app import app; from app.database import db; app.app_context().push(); db.create_all()"
```

### Can't Login
- Default credentials: admin / admin123
- Check caps lock is off
- Clear browser cookies
- Try incognito/private window

### Changes Not Showing
- Hard refresh: Ctrl+F5
- Clear browser cache
- Check if settings were saved
- Restart server

## Security Checklist

Before going live:
- [ ] Change default admin password
- [ ] Create unique admin usernames
- [ ] Set strong SECRET_KEY in environment
- [ ] Use HTTPS in production
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Add CAPTCHA to forms

## Performance Tips

### Optimize Images
- Compress logo before uploading
- Use WebP format if possible
- Keep file size under 100KB

### Database Maintenance
- Delete old inquiries monthly
- Archive converted customers
- Backup database weekly

### Monitor Performance
- Check inquiry response time
- Track conversion rates
- Monitor page load speed
- Review mobile experience

## Support

### Documentation
- `FEATURES_SUMMARY.md` - Complete feature list
- `ISP_IMPROVEMENTS.md` - Improvement suggestions
- `README.md` - Project overview

### File Structure
```
app/
  __init__.py       - App initialization
  models.py         - Database models
  routes.py         - API endpoints
  admin_views.py    - Admin routes
  database.py       - Database config

templates/
  index.html        - Customer homepage
  admin.html        - Admin dashboard

static/
  css/styles.css    - All styles
  js/main.js        - All JavaScript

instance/
  plans.db          - SQLite database
```

## Going Live

### Production Checklist
1. Change SECRET_KEY
2. Update ADMIN_DEFAULT_PASSWORD
3. Use production database (PostgreSQL/MySQL)
4. Set up domain and SSL
5. Configure email notifications
6. Add analytics (Google Analytics)
7. Set up monitoring
8. Create backup strategy

### Environment Variables
```powershell
$env:SECRET_KEY="your-secret-key-here"
$env:ADMIN_DEFAULT_PASSWORD="secure-password"
$env:DATABASE_URL="postgresql://user:pass@host/db"
```

---

**You're all set!** 🎉

Start the server and begin customizing your ISP portal. Check the admin panel to configure everything to match your brand.

Need help? Check `FEATURES_SUMMARY.md` for detailed documentation.
