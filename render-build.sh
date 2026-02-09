#!/bin/bash
# render-build.sh - Build script for Render deployment

set -e

echo "Installing dependencies..."
npm ci

echo "Building Next.js application..."
npm run build

echo "Build complete!"
