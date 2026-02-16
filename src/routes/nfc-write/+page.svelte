<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/components/ui/button';
    import { useNFC } from '$lib/hooks/useNFC.svelte';
    import { Nfc, ArrowLeft, Copy, Check } from 'lucide-svelte';
    import { toast } from 'svelte-sonner';
    import { cn } from '$lib/utils';
    import * as Card from '$lib/components/ui/card';

    const payload = $derived($page.url.searchParams.get('payl') || '');
    const nfc = useNFC();

    async function copyPayload() {
        try {
            await navigator.clipboard.writeText(payload);
            toast.success('Payload copied to clipboard');
        } catch (err) {
            toast.error('Failed to copy payload');
        }
    }
</script>

<div class="container mx-auto p-4 max-w-lg min-h-screen flex flex-col justify-center">
    <div class="mb-8">
        <Button variant="ghost" href="/" class="pl-0 gap-2 mb-4">
            <ArrowLeft class="size-4" /> Cancel
        </Button>
        <h1 class="text-3xl font-bold">Write NFC Tag</h1>
        <p class="text-muted-foreground mt-2">Write the following data to your NFC tag.</p>
    </div>

    {#if !payload}
        <Card.Root class="border-destructive/50 bg-destructive/5 overflow-hidden">
             <Card.Content class="p-8 text-center text-destructive flex flex-col items-center justify-center min-h-[120px]">
                <p class="font-medium">No payload provided to write.</p>
            </Card.Content>
        </Card.Root>
    {:else}
        <div class="space-y-6">
            <Card.Root class="overflow-hidden">
                <Card.Header class="p-6 pb-2">
                    <Card.Title>Data Payload</Card.Title>
                </Card.Header>
                <Card.Content class="p-6 pt-0">
                    <div class="flex items-center gap-2 p-3 bg-muted rounded-lg border">
                        <code class="flex-1 text-sm font-mono break-all">{payload}</code>
                         <Button size="icon" variant="ghost" onclick={copyPayload} class="shrink-0">
                            <Copy class="size-4" />
                        </Button>
                    </div>
                </Card.Content>
            </Card.Root>

             {#if nfc.status === 'unsupported'}
                 <Card.Root class="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 overflow-hidden">
                    <Card.Header class="p-6 pb-2">
                        <Card.Title class="text-orange-800 dark:text-orange-200">Manual Write Required</Card.Title>
                    </Card.Header>
                    <Card.Content class="space-y-4 p-6 pt-0">
                        <p class="text-base text-orange-700 dark:text-orange-300 leading-relaxed">
                            Your browser or device doesn't support direct NFC writing. Please use an external app like <strong>NFC Tools</strong>.
                        </p>
                        <ol class="text-sm space-y-2 list-decimal list-inside text-orange-800 dark:text-orange-200 bg-orange-100/50 dark:bg-orange-900/10 p-4 rounded-lg">
                            <li>Copy the payload above.</li>
                            <li>Open your NFC writing app.</li>
                            <li>Select <strong>Write</strong> &gt; <strong>Add a record</strong>.</li>
                            <li>Select <strong>Text</strong> and paste the payload.</li>
                            <li>Write to your tag.</li>
                        </ol>
                    </Card.Content>
                </Card.Root>
            {:else}
               <Button 
                    variant="magic" 
                    class={cn(
                        "w-full h-16 text-xl transition-all duration-500 shadow-lg",
                        nfc.status === 'success' && "bg-spark-teal shadow-spark-teal/20"
                    )}
                    disabled={nfc.status === 'scanning' || nfc.status === 'writing'}
                    onclick={() => nfc.write(payload)}
                >
                    {#if nfc.status === 'scanning'}
                        <div class="flex items-center gap-3">
                            <span class="animate-pulse">Approach Tag...</span>
                        </div>
                    {:else if nfc.status === 'writing'}
                        <div class="flex items-center gap-3">
                            <Nfc class="animate-spin" />
                            <span>Writing...</span>
                        </div>
                    {:else if nfc.status === 'success'}
                        <div class="flex items-center gap-2 animate-in zoom-in slide-in-from-bottom-2">
                            <Check class="size-6" />
                            <span>Written Successfully!</span>
                        </div>
                    {:else}
                        <div class="flex items-center gap-3">
                            <Nfc class="size-6" />
                            <span>Write to Tag</span>
                        </div>
                    {/if}
                </Button>
                
                {#if nfc.error}
                    <p class="text-sm text-destructive font-medium text-center animate-in fade-in slide-in-from-top-1 px-4">
                        {nfc.error}
                    </p>
                {/if}
            {/if}
        </div>
    {/if}
</div>
