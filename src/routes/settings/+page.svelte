<script lang="ts">
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { registryService } from '$lib/services/registry';
	import { db } from '$lib/db';
    import QRScanner from '$lib/components/QRScanner.svelte';
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

    const updateAll = createMutation(() => ({
        mutationFn: () => registryService.updateAllRegistries(),
        onSuccess: () => {
            toast.success('All registries updated');
            queryClient.invalidateQueries({ queryKey: ['registries'] });
            queryClient.invalidateQueries({ queryKey: ['characters'] });
        },
        onError: (err: any) => {
            toast.error('Failed to update: ' + err.message);
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
                    <div class="flex gap-2">
                        <Input id="url" type="url" placeholder="https://..." bind:value={url} required />
                    </div>
                </div>

                <div class="relative py-2">
                    <div class="absolute inset-0 flex items-center">
                        <span class="w-full border-t"></span>
                    </div>
                    <div class="relative flex justify-center text-xs uppercase">
                        <span class="bg-card px-2 text-muted-foreground">Or</span>
                    </div>
                </div>

                <QRScanner onScan={(scannedUrl) => {
                    url = scannedUrl;
                    addRegistry.mutate(scannedUrl);
                }} />

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

	<div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Manage Registries</h2>
        <Button 
            variant="outline" 
            size="sm" 
            onclick={() => updateAll.mutate()}
            disabled={updateAll.isPending}
        >
            {#if updateAll.isPending}
                Updating...
            {:else}
                Check for Updates
            {/if}
        </Button>
    </div>
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
