<script lang="ts">
    import QRScanner from '$lib/components/QRScanner.svelte';
    import { goto } from '$app/navigation';
    import { toast } from 'svelte-sonner';
    import { ArrowLeft } from 'lucide-svelte';
    import { Button } from '$lib/components/ui/button';

    function handleScan(scannedUrl: string) {
        try {
            // Handle relative URLs by adding a dummy base if needed
            const url = new URL(scannedUrl, window.location.origin);
            const path = url.pathname;
            const params = url.searchParams;

            // Deep link logic
            if (path.includes('/character')) {
                 // Reconstruct the full path + query
                 goto(path + url.search);
                 toast.success('Found Character!');
            } else if (path.includes('/coll-imp')) {
                const registryUrl = params.get('url');
                if (registryUrl) {
                    goto(`/coll-imp?url=${encodeURIComponent(registryUrl)}`);
                    toast.success('Found Collection!');
                } else {
                    toast.error('Invalid Collection QR: Missing URL parameter');
                }
            } else if (path.includes('/nfc-write')) {
                const payload = params.get('payl');
                if (payload) {
                    goto(`/nfc-write?payl=${encodeURIComponent(payload)}`);
                    toast.success('Found NFC Tag Data!');
                } else {
                    toast.error('Invalid NFC QR: Missing payload');
                }
            } else {
                toast.error('Unknown QR Code format');
            }
        } catch (e) {
            console.error(e);
            toast.error('Invalid QR Code');
        }
    }
</script>

<div class="container mx-auto p-4 max-w-md h-[calc(100vh-4rem)] flex flex-col">
    <div class="flex items-center mb-6">
        <Button variant="ghost" href="/" class="pl-0 gap-2">
            <ArrowLeft class="size-4" /> Back to Gallery
        </Button>
    </div>

    <div class="flex-1 flex flex-col items-center justify-center space-y-8">
        <div class="text-center space-y-2">
            <h1 class="text-2xl font-bold tracking-tight">Scan QR Code</h1>
            <p class="text-muted-foreground">Scan a character, collection, or NFC tag code.</p>
        </div>

        <div class="w-full bg-card border rounded-3xl p-4 shadow-sm">
            <QRScanner onScan={handleScan} />
        </div>
    </div>
</div>
