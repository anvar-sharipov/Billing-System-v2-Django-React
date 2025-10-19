#!/bin/sh
set -e

echo "Starting SSL certificate generation..."
/usr/local/bin/generate-ssl.sh

echo "Starting Nginx..."
exec nginx -g "daemon off;"