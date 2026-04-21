# GIA Aircraft Log Management System
### Gambia International Airlines — v2.0

---

## Overview

A fully-featured aircraft log filing system built for GIA ground operations.
Supports secure login, role-based access, full CRUD on log entries, PAX and
freight reporting, user management, and a complete audit trail.

---

## Project Structure

```
gia-website/
├── index.html            ← Main entry point (open this in a browser)
├── css/
│   ├── main.css          ← Base styles, layout, header, sidebar
│   ├── login.css         ← Login screen styles
│   ├── dashboard.css     ← Stats cards and chart styles
│   └── components.css    ← Forms, tables, modals, badges, panels
├── js/
│   ├── data.js           ← Data layer: localStorage & seed data
│   ├── auth.js           ← Login, logout, session timeout
│   ├── ui.js             ← Navigation, clock, modals, toast, detail panel
│   ├── logs.js           ← Log entry CRUD + table rendering
│   ├── users.js          ← User management (Admin only)
│   ├── reports.js        ← PAX and Freight report rendering
│   ├── audit.js          ← Audit trail logging and rendering
│   └── app.js            ← App initialisation and event binding
└── README.md             ← This file
```

---

## Quick Start (Static / Local)

1. Extract the zip file to a folder on your computer.
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge).
3. Log in using the demo credentials below.

> **Note:** Data is stored in the browser's `localStorage`.
> It persists between sessions on the same browser/device.

---

## Demo Credentials

| Role          | Username   | Password  |
|---------------|------------|-----------|
| Administrator | admin      | admin123  |
| Supervisor    | supervisor | sup123    |
| Ground Staff  | staff      | staff123  |

---

## Role Permissions

| Feature              | Admin | Supervisor | Staff |
|----------------------|-------|------------|-------|
| View Dashboard       | ✓     | ✓          | ✓     |
| Create Log Entry     | ✓     | ✓          | ✓     |
| View Log Records     | ✓     | ✓          | ✓     |
| Delete Log Entry     | ✓     | ✓          | ✗     |
| View PAX Report      | ✓     | ✓          | ✓     |
| View Freight Report  | ✓     | ✓          | ✓     |
| User Management      | ✓     | ✗          | ✗     |
| View Audit Trail     | ✓     | ✓          | ✗     |
| Clear Audit Trail    | ✓     | ✗          | ✗     |

---

## Deploying as a Real Website

This is a pure HTML/CSS/JS application — no backend required.
You can host it on any static web server.

### Option A — Simple Web Server (Python)

```bash
cd gia-website
python3 -m http.server 8080
# Visit http://localhost:8080
```

### Option B — NGINX

Copy the project folder to your web root:

```bash
sudo cp -r gia-website/ /var/www/html/gia/
```

Add to your NGINX config:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html/gia;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Option C — Apache

Copy to web root and ensure `.htaccess` allows directory access:

```bash
sudo cp -r gia-website/ /var/www/html/gia/
```

### Option D — Free Cloud Hosting

Upload to any of these free static hosting services:
- **Netlify** — drag & drop the folder at netlify.com/drop
- **Vercel** — `vercel deploy` from the project folder
- **GitHub Pages** — push to a GitHub repo and enable Pages

---

## Production Upgrade Path

The current system uses browser localStorage for data persistence,
which is suitable for a single workstation. For a multi-user, multi-device
production deployment, the following upgrades are recommended:

1. **Backend API** — Node.js (Express) or Python (FastAPI/Django) REST API
2. **Database** — PostgreSQL or MySQL to replace localStorage
3. **Server-side Auth** — JWT tokens or session cookies with bcrypt passwords
4. **HTTPS** — SSL certificate (free via Let's Encrypt)
5. **Backups** — Automated database backups

---

## Browser Support

| Browser         | Support |
|-----------------|---------|
| Chrome 90+      | ✓ Full  |
| Firefox 88+     | ✓ Full  |
| Edge 90+        | ✓ Full  |
| Safari 14+      | ✓ Full  |
| Internet Explorer | ✗ Not supported |

---

## Support

For technical assistance, contact your system administrator.

---

*Gambia International Airlines Ltd. — Aircraft Log Management System v2.0*
