# vue-pdf-demo

Minimal demo: Vue frontend + Vercel Serverless function that generates PDF and sends it by email.

## Run locally (static)

1. serve public:
   npm run start
   open http://localhost:3000

## Run serverless locally (recommended)

1. Install Vercel CLI: npm i -g vercel
2. Run: vercel dev
3. Open: http://localhost:3000

## Deploy

1. Push to GitHub and import project to Vercel
2. In Vercel project settings, set env vars:
   - EMAIL_USER = your@gmail.com
   - EMAIL_PASS = gmail app password
