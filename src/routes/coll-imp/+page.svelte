<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
    import { registryService } from '$lib/services/registry';
    import { Button } from '$lib/components/ui/button';
    import * as Card from '$lib/components/ui/card';
    import { toast } from 'svelte-sonner';
    import { Loader2, ArrowLeft, Check, AlertTriangle } from 'lucide-svelte';
    import { type Registry } from '$lib/schemas';

    const url = $derived($page.url.searchParams.get('url'));
    const queryClient = useQueryClient();

    const validationQuery = createQuery(() => ({
        queryKey: ['validate-registry', url],
        queryFn: async () => {
            if (!url) throw new Error('No URL provided');
            return registryService.fetchAndValidate(url);
        },
        enabled: !!url,
        retry: false
    }));

    const importMutation = createMutation(() => ({
        mutationFn: async (registry: Registry) => {
            if (!url) return;
            await registryService.saveRegistry(url, registry);
        },
        onSuccess: () => {
            toast.success('Collection imported successfully!');
            queryClient.invalidateQueries({ queryKey: ['registries'] });
            queryClient.invalidateQueries({ queryKey: ['characters'] });
            goto('/');
        },
        onError: (err) => {
            toast.error('Failed to import collection: ' + (err instanceof Error ? err.message : String(err)));
        }
    }));

    function handleImport() {
        if (validationQuery.data) {
            importMutation.mutate(validationQuery.data);
        }
    }
</script>

<div class="container mx-auto p-4 max-w-lg min-h-screen flex flex-col justify-center">
    <div class="mb-8">
         <Button variant="ghost" href="/" class="pl-0 gap-2 mb-4">
            <ArrowLeft class="size-4" /> Cancel
        </Button>
        <h1 class="text-3xl font-bold">Import Collection</h1>
        <p class="text-muted-foreground mt-2">You are about to import a new character collection.</p>
    </div>

    {#if !url}
        <Card.Root class="border-destructive/50 bg-destructive/5">
            <Card.Content class="pt-6 text-center text-destructive">
                <AlertTriangle class="mx-auto size-12 mb-4" />
                <p>No URL provided for import.</p>
            </Card.Content>
        </Card.Root>
    {:else if validationQuery.isLoading}
        <div class="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 class="size-12 animate-spin text-primary" />
            <p class="text-muted-foreground">Validating collection...</p>
        </div>
    {:else if validationQuery.isError}
        <Card.Root class="border-destructive">
            <Card.Header>
                <Card.Title class="text-destructive flex items-center gap-2">
                    <AlertTriangle class="size-5" /> Validation Failed
                </Card.Title>
            </Card.Header>
            <Card.Content>
                <p class="text-sm text-foreground/80 mb-4">
                    The collection at <code>{url}</code> could not be validated.
                </p>
                <div class="p-3 bg-muted rounded text-xs font-mono text-destructive break-all">
                    {validationQuery.error.message}
                </div>
            </Card.Content>
            <Card.Footer>
                <Button variant="outline" class="w-full" href="/">Back to Gallery</Button>
            </Card.Footer>
        </Card.Root>
    {:else if validationQuery.data}
        {@const reg = validationQuery.data}
        <Card.Root>
            <Card.Header>
                <Card.Title>{reg.meta.name}</Card.Title>
                <Card.Description>
                    v{reg.meta.version || '1.0'} by {reg.meta.maintainer || 'Unknown'}
                </Card.Description>
            </Card.Header>
            <Card.Content class="space-y-4">
                <div class="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-muted-foreground">Characters</span>
                        <span class="font-medium">{reg.characters.length}</span>
                    </div>
                     <div class="flex justify-between text-sm">
                        <span class="text-muted-foreground">Source</span>
                        <span class="font-medium truncate max-w-[200px]">{url}</span>
                    </div>
                </div>
            </Card.Content>
            <Card.Footer class="flex-col gap-3">
                <Button 
                    class="w-full h-12 text-lg" 
                    onclick={handleImport}
                    disabled={importMutation.isPending}
                >
                    {#if importMutation.isPending}
                        <Loader2 class="mr-2 h-4 w-4 animate-spin" /> Importing...
                    {:else}
                         Import Collection
                    {/if}
                </Button>
                <Button variant="ghost" class="w-full" href="/">Cancel</Button>
            </Card.Footer>
        </Card.Root>
    {/if}
</div>
