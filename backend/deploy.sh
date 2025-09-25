#!/bin/bash
# Deploy script for Cloudflare Pages auto-deployment
echo "Deploying to Cloudflare Workers..."
npx wrangler deploy src/index.ts --env production