<script lang="ts">
	import '../app.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import Header from '$lib/components/Header.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5, // 5 minutes
				refetchOnWindowFocus: false
			}
		}
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<ModeWatcher />
<Toaster position="top-center" richColors />

<QueryClientProvider client={queryClient}>
	<div class="min-h-screen bg-background flex flex-col">
		<Header />
		<main class="flex-1">
			{@render children()}
		</main>
	</div>
</QueryClientProvider>
