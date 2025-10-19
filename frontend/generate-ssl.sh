#!/bin/sh
set -e

CERT_DIR="/etc/nginx/ssl"
CERT_FILE="$CERT_DIR/cert.pem"
KEY_FILE="$CERT_DIR/key.pem"

mkdir -p "$CERT_DIR"

if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
    echo "SSL certificate already exists, skipping generation"
    exit 0
fi

echo "Generating self-signed SSL certificate..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -subj "/C=UZ/ST=Tashkent/L=Tashkent/O=SmartBilling/CN=192.168.25.74" \
    -addext "subjectAltName=IP:192.168.25.74,IP:127.0.0.1,DNS:localhost"

echo "SSL certificate generated successfully"