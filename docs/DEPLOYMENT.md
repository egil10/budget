# Deployment Guide

This guide covers deployment options and best practices for the Statsbudsjettet application.

## 📋 Table of Contents

- [Deployment Options](#deployment-options)
- [GitHub Pages](#github-pages)
- [Local Server](#local-server)
- [Production Setup](#production-setup)
- [Environment Configuration](#environment-configuration)
- [Performance Optimization](#performance-optimization)

## 🚀 Deployment Options

### 1. GitHub Pages (Recommended)
**Best for**: Public hosting, easy updates, free hosting

**Steps**:
1. Push code to GitHub repository
2. Go to repository Settings → Pages
3. Select source branch (usually `main`)
4. Access site at `https://username.github.io/budget`

**Pros**:
- Free hosting
- Automatic HTTPS
- Easy updates via git push
- Custom domain support

**Cons**:
- Limited to static files
- No server-side processing

### 2. Local Server
**Best for**: Development, testing, offline use

**Options**:
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000

# Apache/Nginx
# Copy files to web root directory
```

### 3. Cloud Hosting
**Best for**: Production deployments, custom domains

**Options**:
- **Netlify**: Drag & drop deployment
- **Vercel**: Git-based deployment
- **AWS S3**: Static website hosting
- **Azure Static Web Apps**: Microsoft cloud hosting

## 🌐 GitHub Pages Setup

### Initial Setup
1. **Enable GitHub Pages**:
   ```
   Repository → Settings → Pages
   Source: Deploy from a branch
   Branch: main
   Folder: / (root)
   ```

2. **Configure Repository**:
   ```bash
   # Ensure main branch is default
   git branch -M main
   git push -u origin main
   ```

3. **Access Your Site**:
   ```
   https://yourusername.github.io/budget
   ```

### Custom Domain (Optional)
1. **Add CNAME file**:
   ```bash
   echo "yourdomain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. **Configure DNS**:
   ```
   Type: CNAME
   Name: www
   Value: yourusername.github.io
   
   Type: A
   Name: @
   Value: 185.199.108.153 (GitHub Pages IP)
   ```

### Automated Deployment
GitHub Pages automatically deploys when you push to the main branch:

```bash
# Make changes
git add .
git commit -m "Update budget data"
git push origin main
# Site updates automatically in ~5 minutes
```

## 🏠 Local Server Setup

### Development Server
```bash
# Navigate to project directory
cd budget

# Start Python server
python -m http.server 8000

# Access at http://localhost:8000
```

### Production-like Local Setup
```bash
# Install serve globally
npm install -g serve

# Serve with production settings
serve -s . -l 3000

# Access at http://localhost:3000
```

### Docker Setup (Optional)
```dockerfile
# Dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and run
docker build -t budget-app .
docker run -p 8080:80 budget-app
```

## ⚙️ Production Setup

### File Structure
Ensure your production deployment includes:
```
budget/
├── index.html
├── favicon.ico
├── src/
│   ├── css/
│   ├── js/
│   └── assets/
├── data/
│   └── json/
└── scripts/
```

### Web Server Configuration

#### Apache (.htaccess)
```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>
```

#### Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/budget;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/css application/javascript text/html;

    # Set cache headers
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

## 🔧 Environment Configuration

### Environment Variables
For advanced deployments, you can use environment variables:

```javascript
// config.js
const config = {
    apiBaseUrl: process.env.API_BASE_URL || './data/json',
    debugMode: process.env.DEBUG_MODE === 'true',
    analyticsId: process.env.GA_TRACKING_ID || ''
};
```

### Build Process (Optional)
For optimized production builds:

```bash
# Install build tools
npm install -g uglify-js clean-css-cli

# Minify JavaScript
uglifyjs src/js/*.js -o dist/js/bundle.min.js

# Minify CSS
cleancss -o dist/css/bundle.min.css src/css/*.css
```

## 📊 Performance Optimization

### File Optimization
1. **Minify Resources**:
   ```bash
   # JavaScript
   uglifyjs src/js/main.js -o src/js/main.min.js
   
   # CSS
   cleancss -o src/css/main.min.css src/css/main.css
   ```

2. **Image Optimization**:
   ```bash
   # Install image optimization tools
   npm install -g imagemin-cli
   
   # Optimize images
   imagemin src/assets/* --out-dir=dist/assets
   ```

### Caching Strategy
- **Static Assets**: Cache for 1 year
- **HTML**: Cache for 1 hour
- **JSON Data**: Cache for 1 day

### CDN Integration
For global performance:
```html
<!-- Use CDN for external libraries -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- Or self-host for better control -->
<script src="./src/js/vendor/chart.min.js"></script>
```

## 🔒 Security Considerations

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';">
```

### HTTPS Configuration
- Always use HTTPS in production
- Redirect HTTP to HTTPS
- Use HSTS headers for security

### Data Privacy
- No user data collection
- Client-side processing only
- No tracking cookies

## 📱 Mobile Optimization

### Responsive Design
- Mobile-first CSS approach
- Touch-friendly interface
- Optimized chart sizing

### Performance
- Minimal JavaScript bundle
- Efficient SVG rendering
- Fast loading times

## 🔍 Monitoring & Analytics

### Error Tracking
```javascript
// Add error tracking
window.addEventListener('error', (e) => {
    console.error('Application Error:', e.error);
    // Send to analytics service
});
```

### Performance Monitoring
```javascript
// Monitor page load time
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page loaded in ${loadTime}ms`);
});
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure files are served via HTTP/HTTPS
   - Check file paths are correct
   - Verify JSON files are accessible

2. **Charts Not Rendering**:
   - Check browser console for errors
   - Verify data format in JSON files
   - Ensure SVG support in browser

3. **Mobile Layout Issues**:
   - Test on actual devices
   - Check viewport meta tag
   - Verify responsive CSS

### Debug Mode
Enable debug logging:
```javascript
// Add to main.js
const DEBUG = true;

if (DEBUG) {
    console.log('Debug mode enabled');
    // Additional logging
}
```

## 📈 Scaling Considerations

### High Traffic
- Use CDN for static assets
- Implement caching strategies
- Consider serverless deployment

### Large Datasets
- Implement data pagination
- Use lazy loading for charts
- Optimize data structures

---

*Last updated: October 2025*
