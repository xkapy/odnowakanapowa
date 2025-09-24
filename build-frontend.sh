#!/bin/bash
echo "Installing frontend dependencies..."
cd frontend
pnpm install
echo "Building frontend..."
pnpm run build
echo "Build completed!"