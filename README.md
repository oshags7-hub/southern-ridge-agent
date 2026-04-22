# Southern Ridge Agent Dashboard

An internal farm operations dashboard for Southern Ridge Farm. Provides a real-time agent feed of alerts from on-farm systems (security, payments, livestock, harvest, content), a chat interface for each agent, and a content studio for drafting and managing social/email posts.

## Local development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```
VITE_ANTHROPIC_API_KEY=          # Claude API key for live agent replies
VITE_SHOPIFY_STOREFRONT_TOKEN=   # Shopify Storefront API token
VITE_QUICKBOOKS_CLIENT_ID=       # QuickBooks OAuth client ID
```

None of these are required for local development — the app runs fully on mock data without them.

## Build

```bash
npm run build
```

Output is in `dist/`.

## Deployment

The app deploys automatically to Netlify on every push to `main`. Netlify is configured via `netlify.toml` at the project root.

Live URL: `https://southern-ridge-agent.netlify.app`
