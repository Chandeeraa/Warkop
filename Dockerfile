# =============================================================================
# Stage 1: Build Frontend Assets (Node.js + Vite + React)
# =============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json package-lock.json ./

# Install Node dependencies
RUN npm ci

# Copy all source files needed for Vite build
COPY vite.config.ts tsconfig.json ./
COPY resources/ resources/

# Build the frontend assets
RUN npm run build

# =============================================================================
# Stage 2: PHP + Nginx Production Image
# =============================================================================
FROM php:8.2-fpm-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    zip \
    unzip \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev \
    icu-dev \
    linux-headers

# Install PHP extensions required by Laravel
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    xml \
    intl \
    opcache

# Install Composer
COPY --from=composer:2 /usr/local/bin/composer /usr/local/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files first for caching
COPY composer.json composer.lock ./

# Install PHP dependencies (production only, no dev)
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy the rest of the application
COPY . .

# Copy built frontend assets from Stage 1
COPY --from=frontend-builder /app/public/build public/build

# Generate optimized autoloader & run post-install scripts
RUN composer dump-autoload --optimize \
    && php artisan package:discover --ansi

# Create necessary directories and set permissions
RUN mkdir -p storage/framework/{cache,sessions,views,testing} \
    && mkdir -p storage/logs \
    && mkdir -p bootstrap/cache \
    && mkdir -p storage/app/public \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Copy Nginx configuration
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Copy Supervisord configuration
COPY docker/supervisord.conf /etc/supervisord.conf

# Copy PHP production config
COPY docker/php.ini /usr/local/etc/php/conf.d/99-production.ini

# Copy entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Railway uses PORT env variable
EXPOSE 8080

# Start via entrypoint
ENTRYPOINT ["/entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
