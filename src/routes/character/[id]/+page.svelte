<script lang="ts">
	import { page } from '$app/stores';
	import { createQuery } from '@tanstack/svelte-query';
	import { db } from '$lib/db';
	import { registryService } from '$lib/services/registry';
	import { Button } from '$lib/components/ui/button';
	import { Image } from '@unpic/svelte';
	import { ArrowLeft, Play, Download, Nfc, ExternalLink, Share2 } from 'lucide-svelte';
	import { useNFC } from '$lib/hooks/useNFC.svelte';
    import * as Card from '$lib/components/ui/card';
    import Modal from '$lib/components/Modal.svelte';
    import { toast } from 'svelte-sonner';
    import { createMutation, useQueryClient } from '@tanstack/svelte-query';
    import { goto } from '$app/navigation';
    let { data } = $props();
	const id = $derived($page.params.id);

	const character = createQuery(() => ({
		queryKey: ['character', id],
		queryFn: async () => {
            if (!id) return null;
            return (await db.getCharacter(id)) || null;
        },
        initialData: data.character
	}));

    const nfc = useNFC();
    let showNFCModal = $state(false);

    async function copyPayload(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Payload copied to clipboard');
        } catch (err) {
            toast.error('Failed to copy payload');
        }
    }

    async function handleShare(char: any) {
        const url = new URL(window.location.origin + '/character');
        url.searchParams.set('id', char.id);
        // We need the registry URL. The character object from DB has it.
        url.searchParams.set('registry', char.registry_url);
        
        const shareData = {
            title: `OpenFable - ${char.name}`,
            text: `Check out ${char.name} on OpenFable!`,
            url: url.toString()
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(url.toString());
                toast.success('Link copied to clipboard');
            }
        } catch (err) {
            // share cancelled or failed
        }
    }

    const queryClient = useQueryClient();

    const addRegistry = createMutation(() => ({
        mutationFn: async (url: string) => {
            await registryService.fetchRegistry(url);
        },
        onSuccess: () => {
            toast.success('Collection added to your library');
            queryClient.invalidateQueries({ queryKey: ['character', id] });
            queryClient.invalidateQueries({ queryKey: ['registries'] });
            queryClient.invalidateQueries({ queryKey: ['characters'] });
            
            // Navigate to same page but without search params
            goto(`/character/${id}`, { replaceState: true });
        },
        onError: (err) => {
            toast.error('Failed to add collection: ' + (err instanceof Error ? err.message : String(err)));
        }
    }));

    async function handleAddCollection() {
        if (!char?.registry_url) return;
        
        // Check if already in DB (maybe added in another window)
        const existing = await registryService.getRegistryFromDB(char.registry_url);
        if (existing) {
            toast.info('Collection was already in your library');
            // Just clean up the URL
            goto(`/character/${id}`, { replaceState: true });
            return;
        }

        addRegistry.mutate(char.registry_url);
    }

    const char = $derived(character.data);
    const isViewOnce = $derived($page.url.searchParams.get('viewOnce') === 'true');
</script>

<div class="container mx-auto p-4 max-w-4xl">
    {#if isViewOnce}
        <div class="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg mb-6 flex items-center justify-between">
            <div class="flex items-center">
                <ExternalLink class="w-4 h-4 mr-2" />
                <span class="text-sm font-medium">Temporary View: This character is not in your collection.</span>
            </div>
            <Button 
                variant="outline" 
                size="sm" 
                class="h-8 border-blue-300 text-blue-800 hover:bg-blue-100" 
                onclick={handleAddCollection}
                disabled={addRegistry.isPending}
            >
                {#if addRegistry.isPending}
                    Adding...
                {:else}
                    Add Collection
                {/if}
            </Button>
        </div>
    {/if}

    <div class="flex items-center justify-between mb-4">
        <Button variant="ghost" href="/" class="pl-0 hover:bg-transparent hover:underline">
            <ArrowLeft class="mr-2 h-4 w-4" /> Back to Gallery
        </Button>
        
        {#if char}
            <Button variant="outline" size="sm" onclick={() => handleShare(char)}>
                <Share2 class="mr-2 h-4 w-4" /> Share
            </Button>
        {/if}
    </div>

	{#if character.isError || !char}
		<div class="text-center py-20">
			<h2 class="text-2xl font-bold mb-4">Character Not Found</h2>
			<p class="text-muted-foreground mb-8">The character you are looking for does not exist in your local database.</p>
			<Button href="/">Back to Gallery</Button>
		</div>
	{:else}
		<div class="space-y-8">
            <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-4">
                    <Card.Root 
                        class="overflow-hidden bg-muted" 
                        style="view-transition-name: char-card-{id}"
                    >
                        <Image 
                            src={char.gallery_images[0] || char.preview_image} 
                            alt={char.name}
                            layout="fullWidth"
                            class="aspect-square object-cover"
                        />
                    </Card.Root>
                    
                    {#if char.gallery_images && char.gallery_images.length > 1}
                        <div class="grid grid-cols-4 gap-2">
                            {#each char.gallery_images as img}
                                <div class="aspect-square bg-muted rounded-md overflow-hidden border">
                                    <Image src={img} alt="" layout="fullWidth" class="object-cover h-full" />
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>

                <div class="space-y-6">
                    <div>
                        <h1 class="text-3xl font-bold">{char.name}</h1>
                        <p class="text-muted-foreground mt-2">{char.description || 'No description available.'}</p>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        {#if char.audio_sample_url}
                            <div class="flex items-center space-x-2 w-full p-3 border rounded-lg bg-card">
                                <Button size="icon" variant="ghost">
                                    <Play class="h-4 w-4" />
                                </Button>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium">Preview Audio</p>
                                    <audio src={char.audio_sample_url} controls class="w-full h-8 mt-1"></audio>
                                </div>
                            </div>
                        {/if}
                        
                        {#if char.audio_zip_url}
                            <Button variant="outline" class="w-full" href={char.audio_zip_url} target="_blank">
                                <Download class="mr-2 h-4 w-4" /> Download Audio Assets (.zip)
                            </Button>
                        {/if}
                    </div>

                    <div class="space-y-4 pt-4 border-t">
                        <h3 class="font-semibold flex items-center">
                            <Nfc class="mr-2 h-4 w-4" /> Write to Tag
                        </h3>
                        
                        <div class="space-y-2">
                            {#if nfc.status === 'unsupported'}
                                <Button 
                                    variant="secondary" 
                                    class="w-full h-12 text-lg" 
                                    onclick={() => showNFCModal = true}
                                >
                                    How to Write Tag
                                </Button>
                            {:else}
                                <Button 
                                    class="w-full h-12 text-lg" 
                                    disabled={nfc.status === 'scanning' || nfc.status === 'writing'}
                                    onclick={() => char.nfc_payload && nfc.write(char.nfc_payload)}
                                >
                                    {#if nfc.status === 'scanning'}
                                        Approach Tag...
                                    {:else if nfc.status === 'writing'}
                                        Writing...
                                    {:else}
                                        Write to Tag
                                    {/if}
                                </Button>
                                {#if nfc.error}
                                    <p class="text-xs text-red-500">{nfc.error}</p>
                                {/if}
                                {#if nfc.status === 'success'}
                                    <p class="text-xs text-green-600 font-medium text-center">Successfully written!</p>
                                {/if}
                            {/if}
                        </div>
                    </div>
                </div>
            </div>

            <Modal bind:open={showNFCModal} title="How to Write NFC Tag">
                <div class="space-y-4 py-2">
                    <p class="text-sm text-muted-foreground">
                        Your browser doesn't support direct NFC writing. You can still write this character using the <strong>NFC Tools</strong> app:
                    </p>
                    <ol class="text-sm space-y-2 list-decimal list-inside">
                        <li>Copy the payload below.</li>
                        <li>Open the <strong>NFC Tools</strong> app on your phone.</li>
                        <li>Select <strong>Write</strong> &gt; <strong>Add a record</strong>.</li>
                        <li>Select <strong>Text</strong> and paste the payload.</li>
                        <li>Tap <strong>Write</strong> and hold your phone near the tag.</li>
                    </ol>
                    <div class="mt-4">
                        <p class="text-xs font-semibold mb-1">Payload:</p>
                        <div class="flex items-center gap-2 p-2 bg-muted rounded border">
                            <code class="flex-1 text-xs break-all">{char.nfc_payload}</code>
                            <Button size="sm" variant="ghost" onclick={() => copyPayload(char.nfc_payload || '')}>
                                Copy
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {#if char.models_3d && char.models_3d.length > 0}
                <div class="space-y-4">
                    <h2 class="text-xl font-bold">3D Models</h2>
                    <div class="grid gap-4 sm:grid-cols-2">
                        {#each char.models_3d as model}
                            <Card.Root>
                                <Card.Content class="p-4 flex items-center justify-between">
                                    <span class="capitalize">{model.provider} Model</span>
                                    <Button variant="ghost" size="sm" href={model.url} target="_blank">
                                        View <ExternalLink class="ml-2 h-3 w-3" />
                                    </Button>
                                </Card.Content>
                            </Card.Root>
                        {/each}
                    </div>
                </div>
            {/if}
		</div>
	{/if}
</div>
