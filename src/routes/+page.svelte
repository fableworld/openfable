<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { db } from '$lib/db';
	import type { Character } from '$lib/schemas';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Image } from '@unpic/svelte';
	import { Search } from 'lucide-svelte';
    import { createVirtualizer } from '@tanstack/svelte-virtual';
    import { onMount, unmount } from 'svelte';

	let searchQuery = $state('');
    let containerElement = $state<HTMLDivElement | null>(null);
    let itemsPerRow = $state(4); // Default for desktop
    let containerWidth = $state(0);

	const characters = createQuery(() => ({
		queryKey: ['characters'],
		queryFn: db.getAllCharacters
	}));

	// Derived state for filtering and sorting
	const filteredCharacters = $derived(
		(characters.data || [])
			.filter((c) =>
				c.name.toLowerCase().includes(searchQuery.toLowerCase())
			)
			.sort((a, b) => {
				const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
				const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
				return dateB - dateA;
			})
	);

    // Group items into rows
    const rows = $derived.by(() => {
        const result = [];
        for (let i = 0; i < filteredCharacters.length; i += itemsPerRow) {
            result.push(filteredCharacters.slice(i, i + itemsPerRow));
        }
        return result;
    });

    const virtualizer = createVirtualizer({
        get count() { return rows.length; },
        getScrollElement: () => containerElement,
        estimateSize: () => 300, // Estimate height of a row
        overscan: 5
    });

    onMount(() => {
        const updateWidth = () => {
            if (containerElement) {
                containerWidth = containerElement.clientWidth;
                if (containerWidth < 640) itemsPerRow = 2; // sm
                else if (containerWidth < 1024) itemsPerRow = 3; // md
                else itemsPerRow = 4; // lg
            }
        };
        
        const resizeObserver = new ResizeObserver(updateWidth);
        if (containerElement) resizeObserver.observe(containerElement);
        updateWidth();

        return () => {
            if (containerElement) resizeObserver.unobserve(containerElement);
        };
    });
</script>

<div class="container mx-auto p-6 max-w-7xl">
	<div class="space-y-8">
        <div class="flex flex-col gap-4">
            <h1 class="text-4xl font-extrabold tracking-tight lg:text-5xl">
                My <span class="text-brand-indigo">Characters</span>
            </h1>
            <div class="flex items-center space-x-3 max-w-md bg-muted/50 rounded-full px-4 py-2 border border-border focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Search class="w-5 h-5 text-muted-foreground" />
                <input 
                    type="search" 
                    placeholder="Search characters..." 
                    bind:value={searchQuery} 
                    class="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                />
            </div>
        </div>
	
		{#if characters.isLoading}
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{#each Array(8) as _}
					<div class="space-y-4">
	                    <div class="aspect-square w-full rounded-2xl bg-muted animate-pulse"></div>
	                    <div class="space-y-2">
	                        <div class="h-4 w-2/3 rounded bg-muted animate-pulse"></div>
	                    </div>
	                </div>
				{/each}
			</div>
		{:else if characters.isError}
			<div class="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
				<p class="text-destructive font-medium">Error loading characters: {characters.error?.message}</p>
				<Button variant="magic" class="mt-4" onclick={() => characters.refetch()}>Retry</Button>
			</div>
		{:else if filteredCharacters.length === 0}
			<div class="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
				<p class="text-muted-foreground">No characters found.</p>
				<Button variant="secondary" class="mt-4" href="/settings">Add a Collection</Button>
			</div>
		{:else}
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{#each filteredCharacters as character (character.id)}
					<a 
                        href="/character/{character.id}" 
                        class="group" 
                        style="view-transition-name: char-card-{character.id}"
                    >
						<Card.Root class="h-full border-none p-0 bg-surface shadow-xs">
							<div class="aspect-square relative overflow-hidden rounded-2xl">
								<Image
									src={character.preview_image || character.gallery_images[0]}
									alt={character.name}
									layout="fullWidth"
									class="object-cover transition-transform duration-500 group-hover:scale-110"
								/>
                                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
							</div>
							<Card.Content class="p-4">
								<h3 class="font-bold text-lg truncate group-hover:text-brand-indigo transition-colors">{character.name}</h3>
							</Card.Content>
						</Card.Root>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
