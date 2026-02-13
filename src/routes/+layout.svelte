<script lang="ts">
	import '../app.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import Header from '$lib/components/Header.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';

	import { onMount } from 'svelte';
	import { registryService } from '$lib/services/registry';
	import { db } from '$lib/db';
    import { DEFAULT_REGISTRY_URL } from '$lib/constants';
    import { onNavigate } from '$app/navigation';

	let { children } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5, // 5 minutes
				refetchOnWindowFocus: false
			}
		}
	});

	onMount(async () => {
		// Background update logic
		const registries = await db.getRegistries();
		const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
		const now = Date.now();

		// Check if any registry hasn't been updated in 3 days
		const needsUpdate = registries.some(r => (now - (r.added_at || 0)) > THREE_DAYS_MS);
		
		if (registries.length === 0) {
            console.log('Initializing default registry...');
            await registryService.fetchRegistry(DEFAULT_REGISTRY_URL);
            queryClient.invalidateQueries({ queryKey: ['registries'] });
            queryClient.invalidateQueries({ queryKey: ['characters'] });
        } else if (needsUpdate) {
			console.log('Triggering background registry update...');
			registryService.updateAllRegistries().then(() => {
				queryClient.invalidateQueries({ queryKey: ['registries'] });
				queryClient.invalidateQueries({ queryKey: ['characters'] });
			});
		}
	});

    // Enable View Transitions API
    onNavigate((navigation) => {
        if (!document.startViewTransition) return;

        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
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
