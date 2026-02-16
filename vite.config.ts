import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			includeAssets: ['favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
			manifest: {
				name: 'OpenFable',
				short_name: 'OpenFable',
				description: 'Decentralized manager for custom audio characters',
				theme_color: '#F8FAFC',
				background_color: '#F8FAFC',
				display: 'standalone',
				icons: [
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'registry-data',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
							}
						}
					}
				]
			}
		})
	]
});
