#!/bin/sh
set -e

echo "🚀 Starting Warkop Emi POS deployment..."

# === Generate APP_KEY if not set ===
if [ -z "$APP_KEY" ]; then
    echo "⚙️  Generating APP_KEY..."
    php artisan key:generate --force
fi

# === Laravel optimization for production ===
echo "⚡ Optimizing Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# === Run migrations ===
echo "🗄️  Running database migrations..."
php artisan migrate --force

# === Create storage symlink ===
echo "🔗 Creating storage symlink..."
php artisan storage:link --force 2>/dev/null || true

# === Fix permissions ===
echo "🔒 Setting permissions..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "✅ Warkop Emi POS is ready!"

# Execute the main command (supervisord)
exec "$@"
