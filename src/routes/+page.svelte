<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { db } from '$lib/db';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { Image } from '@unpic/svelte';
	import { Search } from 'lucide-svelte';

	let searchQuery = $state('');

	const characters = createQuery(() => ({
		queryKey: ['characters'],
		queryFn: db.getAllCharacters
	}));

	// Derived state for filtering
	const filteredCharacters = $derived(
		characters.data?.filter((c) =>
			c.name.toLowerCase().includes(searchQuery.toLowerCase())
		) ?? []
	);
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
				{#each filteredCharacters as character}
					<a href="/character/{character.id}" class="group">
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
