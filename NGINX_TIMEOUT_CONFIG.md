# Nginx Timeout Configuration untuk NusantaraX

## Problem
API Caption Generator dan Image Generator membutuhkan waktu lama (30-60 detik atau lebih) untuk memproses AI requests, tapi nginx default timeout adalah 60 detik, menyebabkan 504 Gateway Timeout.

## Solution
Update nginx configuration dengan timeout 30 menit untuk AI endpoints:

```nginx
# /etc/nginx/sites-available/nusantarax-api
server {
    listen 443 ssl http2;
    server_name api.nusantarax.web.id;
    
    # SSL configuration...
    
    # Extended timeouts for AI operations
    client_max_body_size 50M;
    client_body_timeout 1800s;     # 30 minutes
    client_header_timeout 1800s;   # 30 minutes
    send_timeout 1800s;            # 30 minutes
    
    # Proxy settings with extended timeouts
    location /api/ {
        proxy_pass http://127.0.0.1:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Extended proxy timeouts (30 minutes)
        proxy_connect_timeout 1800s;
        proxy_send_timeout 1800s;
        proxy_read_timeout 1800s;
        
        # Specific longer timeouts for AI endpoints
        location ~ ^/api/(caption-generator/generate|image-generator/generate-template|image-generator/generate-custom|ai-assistant/send-message)$ {
            proxy_pass http://127.0.0.1:4000;
            proxy_connect_timeout 1800s;
            proxy_send_timeout 1800s;
            proxy_read_timeout 1800s;
            
            # CORS headers (avoid duplication)
            add_header Access-Control-Allow-Origin "https://nusantarax.web.id" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
            add_header Access-Control-Allow-Credentials "true" always;
            
            if ($request_method = 'OPTIONS') {
                add_header Access-Control-Allow-Origin "https://nusantarax.web.id";
                add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
                add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With";
                add_header Access-Control-Allow-Credentials "true";
                add_header Content-Length 0;
                add_header Content-Type text/plain;
                return 204;
            }
        }
    }
}
```

## Backend PM2 Configuration
Update backend PM2 config untuk handle long-running requests:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'nusantarax-backend',
    script: './dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    // Increased timeouts
    kill_timeout: 30000,
    listen_timeout: 10000,
    // Health check
    health_check_url: 'http://localhost:4000/health',
    // Restart conditions
    max_restarts: 10,
    min_uptime: '10s',
    // Memory and CPU limits
    max_memory_restart: '2G'
  }]
}
```

## Commands untuk Apply Changes

1. **Update Nginx Config:**
```bash
sudo nano /etc/nginx/sites-available/nusantarax-api
```

2. **Test Nginx Config:**
```bash
sudo nginx -t
```

3. **Reload Nginx:**
```bash
sudo systemctl reload nginx
```

4. **Restart Backend dengan PM2:**
```bash
pm2 restart nusantarax-backend
```

5. **Monitor Logs:**
```bash
pm2 logs nusantarax-backend --lines 50
```

## Verifikasi
Setelah apply config:
1. Test caption generator dengan upload gambar
2. Check response time di browser network tab
3. Monitor nginx access logs: `sudo tail -f /var/log/nginx/access.log`
4. Monitor backend logs: `pm2 logs nusantarax-backend`

## Additional Notes
- Frontend axios timeout sudah diset ke 30 menit
- Caption generator butuh 2 AI requests (bisa 30-120 detik)
- Image generator butuh AI analysis + image generation (bisa 60-180 detik)
- CORS headers sudah dikonfigurasi untuk avoid duplication