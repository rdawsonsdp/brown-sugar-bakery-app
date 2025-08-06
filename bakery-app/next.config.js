/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://ohvtwtjnxbazawkuavwk.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9odnR3dGpueGJhemF3a3VhdndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDk0MTUsImV4cCI6MjA2OTM4NTQxNX0.gAeGVYOz5nMHJPaHiF9F3VD5WcKPGZjzrIzCgLf4Gv8',
  },
}

module.exports = nextConfig