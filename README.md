# Mehrusa Wholesale Website

React (Vite) wholesale frontend + Laravel admin for Homepage Hero and SEO.

## Quick start

**Frontend**
```bash
npm install
npm run dev
```

**Admin (Laravel)**
```bash
cd laravel-admin
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

- Website: http://localhost:5173  
- Admin: http://127.0.0.1:8000/admin/login  
- Default login: `admin@mehrusa.com` / `admin123`
