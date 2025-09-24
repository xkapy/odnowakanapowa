// API Configuration
// For production: Set VITE_API_URL in Cloudflare Pages Environment Variables
// For local dev: Set VITE_API_URL in .env file
export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.odnowakanapowa.pl";

console.log("API_BASE_URL:", API_BASE_URL);
console.log("VITE_API_URL from env:", import.meta.env.VITE_API_URL);
