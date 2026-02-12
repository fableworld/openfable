<script lang="ts">
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { registryService } from '$lib/services/registry';
	import { db } from '$lib/db';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';

	const queryClient = useQueryClient();

	let url = $state('');

	const registries = createQuery(() => ({
		queryKey: ['registries'],
		queryFn: db.getRegistries
	}));

	const addRegistry = createMutation(() => ({
		mutationFn: (url: string) => registryService.fetchRegistry(url),
		onSuccess: () => {
			toast.success('Registry added');
			queryClient.invalidateQueries({ queryKey: ['registries'] });
			url = '';
		},
		onError: (err: any) => {
			toast.error('Failed to add registry: ' + err.message);
		}
	}));

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!url) return;
		addRegistry.mutate(url);
	}

	const removeRegistry = createMutation(() => ({
		mutationFn: (url: string) => db.removeRegistry(url),
		onSuccess: () => {
			toast.success('Registry removed');
			queryClient.invalidateQueries({ queryKey: ['registries'] });
		}
	}));
</script>

<div class="container mx-auto p-4 max-w-2xl">
	<h1 class="text-3xl font-bold mb-6">Settings</h1>

	<Card.Root class="mb-8">
		<Card.Header>
			<Card.Title>Add Registry</Card.Title>
		</Card.Header>
		<Card.Content>
			            <form onsubmit={handleSubmit} class="space-y-4">
                <div class="space-y-2">
                    <Label for="url">Registry JSON URL</Label>
                    <Input id="url" type="url" placeholder="https://..." bind:value={url} required />
                </div>
                <Button type="submit" class="w-full" disabled={addRegistry.isPending}>
                    {#if addRegistry.isPending}
                        Adding...
                    {:else}
                        Add Registry
                    {/if}
                </Button>
            </form>
		</Card.Content>
	</Card.Root>

	<h2 class="text-xl font-semibold mb-4">Manage Registries</h2>
	<Card.Content>
            {#if registries.isLoading}
                <p class="text-center py-4 text-muted-foreground">Loading registries...</p>
            {:else if registries.isError}
                <p class="text-center py-4 text-red-500">Error: {registries.error?.message}</p>
            {:else if !registries.data || registries.data.length === 0}
                <p class="text-center py-4 text-muted-foreground">No registries added yet.</p>
            {:else}
                <div class="space-y-4">
                    {#each registries.data as registry}
                        <div class="flex items-center justify-between p-3 border rounded-lg">
                            <div class="flex-1 min-w-0">
                                <p class="font-medium truncate">{registry.meta.name}</p>
                                <p class="text-sm text-muted-foreground truncate">{registry.url}</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                class="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onclick={() => removeRegistry.mutate(registry.url)}
                                disabled={removeRegistry.isPending}
                            >
                                Remove
                            </Button>
                        </div>
                    {/each}
                </div>
            {/if}
        </Card.Content>
</div>
