<script lang="ts">
	import { page } from '$app/stores';
	import { createQuery } from '@tanstack/svelte-query';
	import { db } from '$lib/db';
	import { Button } from '$lib/components/ui/button';
	import { Image } from '@unpic/svelte';
	import { ArrowLeft, Play, Download, Nfc, ExternalLink } from 'lucide-svelte';
	import { useNFC } from '$lib/hooks/useNFC.svelte';
    import * as Card from '$lib/components/ui/card';
    
	const id = $derived($page.params.id);

	const character = createQuery(() => ({
		queryKey: ['character', id],
		queryFn: () => db.getCharacter(id)
	}));

    const nfc = useNFC();
</script>

<div class="container mx-auto p-4 max-w-4xl">
    <Button variant="ghost" href="/" class="mb-4 pl-0 hover:bg-transparent hover:underline">
        <ArrowLeft class="mr-2 h-4 w-4" /> Back to Gallery
    </Button>

	{#if character.isLoading}
		<div class="animate-pulse space-y-4">
            <div class="h-64 w-full bg-muted rounded-xl"></div>
            <div class="h-8 w-1/2 bg-muted rounded"></div>
            <div class="h-4 w-full bg-muted rounded"></div>
        </div>
	{:else if character.isError}
		<div class="text-center py-12 text-red-500">
			<p>Error loading character: {character.error?.message}</p>
			<Button class="mt-4" variant="outline" href="/">Back to Gallery</Button>
		</div>
    {:else if !character.data}
        <div class="text-center py-12 text-muted-foreground">
			<p>Character not found (ID: {id})</p>
			<Button class="mt-4" variant="outline" href="/">Back to Gallery</Button>
		</div>
	{:else}
        {@const char = character.data}
		<div class="space-y-8">
            <div class="grid gap-6 md:grid-cols-2">
                <Card.Root class="overflow-hidden bg-muted">
                    <Image 
                        src={char.gallery_images[0] || char.preview_image} 
                        alt={char.name}
                        layout="fullWidth"
                        class="aspect-square object-cover"
                    />
                </Card.Root>

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
                        
                        {#if nfc.status === 'unsupported'}
                            <div class="p-4 bg-amber-50 text-amber-900 rounded-lg text-sm">
                                <p class="font-bold">WebNFC not supported</p>
                                <p class="mt-1">To write tags on iOS or other browsers, use an app like NFC Tools with the following payload:</p>
                                <code class="block mt-2 p-2 bg-amber-100 rounded break-all">{char.nfc_payload}</code>
                            </div>
                        {:else}
                            <div class="space-y-2">
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
                            </div>
                        {/if}
                    </div>
                </div>
            </div>

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
