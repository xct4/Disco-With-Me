# Discord Webhook Multi-Tool

Client-side multi-tool for Discord webhooks. Personalize, send messages, build embeds, inspect, and manage Discord webhooks directly from the browser.

## Features

- **Direct Client Execution**: All requests are dispatched directly from the browser to Discord's API. No intermediate backend server, external proxy, or telemetry database.
- **Message Dispatcher**: Plain text, markdown formatting shortcuts, mentions, file attachments, and rate-limit backoff.
- **Embed Builder**: Multi-embed support (up to 10), custom colors, author headers, inline field grids, media thumbnails/images, and footer timestamps.
- **Native Polls**: Create and preview single or multi-select native Discord polls with configurable duration.
- **Real-Time Preview**: Live visual representation replicating the Discord desktop client UI.
- **Webhook Management**: Inspect details (guild, channel, ID) and patch webhook attributes (name, base64 avatar).
- **Local Persistence**: Save frequently used webhooks and review the last 50 transmissions via browser localStorage.

## Deployment

### Vercel

Push the repository to GitHub and import it into Vercel.

- **Framework Preset**: Vite
- **Build Command**: `vite build`
- **Output Directory**: `dist`
- **Install Command**: `bun install` or `npm install`
