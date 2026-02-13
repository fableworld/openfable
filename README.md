# OpenFable

OpenFable is a decentralized Progressive Web App (PWA) designed for managing custom audio characters and writing their data to NFC tags. It allows users to discover, collect, and interact with characters from various registries.

## 🚀 Features

- **Decentralized Registry**: Add and manage collections from any JSON registry URL.
- **NFC Tag Writing**: Write character data directly to NFC tags (WebNFC on Android, manual payload copy on iOS).
- **Virtualized Gallery**: Smooth, high-performance character discovery even with thousands of entries.
- **QR Scanning**: Quickly add new registries by scanning QR codes.
- **Character Sharing**: Share links to specific characters that include registry information for seamless recipient discovery.
- **Offline First**: Full offline support using IndexedDB and Service Workers.
- **Hero Transitions**: Premium UI feel with shared-element transitions between views.

## 🛠️ Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) (Svelte 5)
- **State & Data**: [@tanstack/svelte-query](https://tanstack.com/query/latest), [IndexedDB (idb)](https://github.com/jakearchibald/idb)
- **Validation**: [Zod](https://zod.dev/)
- **QR Scanning**: [html5-qrcode](https://github.com/mebjas/html5-qrcode)
- **Images**: [@unpic/svelte](https://unpic.pics/img/svelte/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide Svelte](https://lucide.dev/guide/svelte)

## 💻 Developing

Once you've cloned the repository and installed dependencies with `npm install`, start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## 📦 Building

To create a production version of your app:

```sh
npm run build
```

## 📜 Registry Format

OpenFable uses a simple JSON format for registries. See `public/test-registry.json` for an example of how to structure your own collection.

## 🌐 Managing CORS for Custom Registries

Since OpenFable is a client-side PWA, fetching registries from a different domain requires the remote server to allow CORS. If you encounter a "Failed to fetch" error, try these solutions:

1.  **Host on GitHub**: Raw files from GitHub (`raw.githubusercontent.com`) automatically have CORS enabled.
2.  **Add CORS Headers**: Ensure your server sends the header `Access-Control-Allow-Origin: *`.
3.  **Static Hosting**: Platforms like Netlify, Vercel, and Cloudflare Pages allow you to configure CORS headers in a config file (e.g., `_headers` or `vercel.json`).
4.  **S3/Bucket Storage**: If using AWS S3 or Google Cloud Storage, configure the CORS policy on the bucket to allow your application's origin.
