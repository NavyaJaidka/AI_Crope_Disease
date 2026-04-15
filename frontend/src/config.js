// API base URL — override with VITE_API_URL environment variable
let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
