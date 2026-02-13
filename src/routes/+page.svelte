<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { db } from '$lib/db';
	import type { Character } from '$lib/schemas';
	import { Input } from '$lib/components/ui/input';
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

<div class="container mx-auto p-4 max-w-7xl">
	<div class="space-y-6">
		<div class="flex items-center space-x-2 max-w-md">
			<Search class="w-5 h-5 text-muted-foreground" />
			<Input type="search" placeholder="Search characters..." bind:value={searchQuery} />
		</div>
	
		{#if characters.isLoading}
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{#each Array(8) as _}
					<div class="space-y-3">
	                    <div class="h-40 w-full rounded-xl bg-muted animate-pulse"></div>
	                    <div class="space-y-2">
	                        <div class="h-4 w-2/3 rounded bg-muted animate-pulse"></div>
	                        <div class="h-4 w-1/3 rounded bg-muted animate-pulse"></div>
	                    </div>
	                </div>
				{/each}
			</div>
		{:else if characters.isError}
			<div class="text-center py-12 text-red-500">
				<p>Error loading characters: {characters.error?.message}</p>
				<Button class="mt-4" onclick={() => characters.refetch()}>Retry</Button>
			</div>
		{:else if filteredCharacters.length === 0}
			<div class="text-center py-12 text-muted-foreground">
				<p>No characters found.</p>
				<Button variant="outline" class="mt-4" href="/settings">Add a Collection</Button>
			</div>
		{:else}
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{#each filteredCharacters as character (character.id)}
					<a 
                        href="/character/{character.id}" 
                        class="group" 
                        style="view-transition-name: char-card-{character.id}"
                    >
						<Card.Root class="overflow-hidden transition-all hover:ring-2 hover:ring-primary">
							<div class="aspect-square relative overflow-hidden bg-muted">
								<Image
									src={character.preview_image || character.gallery_images[0]}
									alt={character.name}
									layout="fullWidth"
									class="object-cover transition-transform group-hover:scale-105"
								/>
							</div>
							<Card.Content class="p-4">
								<h3 class="font-bold truncate">{character.name}</h3>
							</Card.Content>
						</Card.Root>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
