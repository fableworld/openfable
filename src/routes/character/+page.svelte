<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { db } from '$lib/db';
	import { registryService } from '$lib/services/registry';
	import { Button } from '$lib/components/ui/button';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';

	const id = $page.url.searchParams.get('id');
	const registryUrl = $page.url.searchParams.get('registry');
    
    // Registry details (if we fetch it)
    let fetchedRegistry = $state<any>(null);
    let error = $state<string | null>(null);
    
    const queryClient = useQueryClient();

    const addRegistry = createMutation(() => ({
        mutationFn: async () => {
             if (!registryUrl) return;
             await registryService.fetchRegistry(registryUrl);
        },
        onSuccess: () => {
             toast.success('Collection added to your library');
             queryClient.invalidateQueries({ queryKey: ['registries'] });
             queryClient.invalidateQueries({ queryKey: ['characters'] }); // Refresh gallery too
             if (id) {
                 goto(`/character/${id}`);
             } else {
                 goto('/');
             }
        },
        onError: (err) => {
             toast.error('Failed to add collection');
             error = String(err);
        }
    }));

	onMount(async () => {
		if (!id || !registryUrl) {
			goto('/');
            return;
		}

		const existing = await registryService.getRegistryFromDB(registryUrl);
		if (existing) {
             goto(`/character/${id}`);
		} else {
             try {
                 const res = await fetch(registryUrl);
                 if (res.ok) {
                     fetchedRegistry = await res.json();
                 } else {
                     error = `Failed to load collection: ${res.statusText}`;
                 }
             } catch (e) {
                 error = "Could not load collection info.";
             }
		}
	});

    function handleViewOnce() {
         // To view once, we might strictly need to add it to DB or having a separate store.
         // Given complexity, and requirement "App checks if ... already known", 
         // "View Once" implies using the data without persistence. 
         // But our architecture relies on DB for `db.getCharacter(id)`.
         // So for "View Once", maybe we add it and remove it later? Or pass data via state?
         // Simplest MVP: Just support "Add". "View Once" is nice to have but adding is safer.
         // Or hack: Add it but mark as temporary?
         // Let's just implement "Add" for now as per "Input Methods" requirement focus.
         // Actually I'll just redirect to home if canceled.
         
         // User scenario: "This character belongs to a new collection..."
         // I'll stick to "Add key" flow.
    }
</script>

<div class="container mx-auto flex h-screen items-center justify-center p-4">
    <Card.Root class="w-full max-w-md">
        <Card.Header>
            <Card.Title>New Collection Found</Card.Title>
            <Card.Description>
                 This character belongs to a collection you don't have yet.
            </Card.Description>
        </Card.Header>
        <Card.Content>
            {#if error}
                <div class="text-red-500 mb-4">{error}</div>
                <Button class="w-full" href="/">Go Home</Button>
            {:else if fetchedRegistry}
                 <div class="mb-4">
                     <h3 class="font-bold text-lg">{fetchedRegistry.meta?.name || 'Unknown Collection'}</h3>
                     <p class="text-muted-foreground">{fetchedRegistry.meta?.maintainer || 'Unknown Author'}</p>
                     <p class="text-sm mt-2 text-muted-foreground break-all">{registryUrl}</p>
                 </div>
                 
                 <div class="space-y-2">
                     <Button class="w-full" onclick={() => addRegistry.mutate()}>
                         {#if addRegistry.isPending}
                             Adding...
                         {:else}
                             Add Collection & View Character
                         {/if}
                     </Button>
                     <Button variant="outline" class="w-full" href="/">Cancel</Button>
                 </div>
            {:else}
                 <div class="flex justify-center py-8">
                     <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                 </div>
                 <p class="text-center text-muted-foreground">Verifying collection...</p>
            {/if}
        </Card.Content>
    </Card.Root>
</div>
