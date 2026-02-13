<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Html5Qrcode } from 'html5-qrcode';
    import { Button } from '$lib/components/ui/button';
    import { Camera, CameraOff, X } from 'lucide-svelte';

    let { onScan } = $props<{ onScan: (url: string) => void }>();
    
    let html5QrCode: Html5Qrcode | null = null;
    let isScanning = $state(false);
    let error = $state<string | null>(null);

    const cameraId = "qr-reader";

    async function startScan() {
        error = null;
        isScanning = true;
        
        // Wait for DOM
        setTimeout(async () => {
            try {
                html5QrCode = new Html5Qrcode(cameraId);
                const config = { fps: 10, qrbox: { width: 250, height: 250 } };
                
                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        stopScan();
                        onScan(decodedText);
                    },
                    (errorMessage) => {
                        // Suppress constant "non-found" logs
                    }
                );
            } catch (err) {
                console.error("Scanner Error:", err);
                error = "Could not access camera. Please check permissions.";
                isScanning = false;
            }
        }, 100);
    }

    async function stopScan() {
        if (html5QrCode && html5QrCode.isScanning) {
            await html5QrCode.stop();
            await html5QrCode.clear();
        }
        isScanning = false;
    }

    onDestroy(() => {
        if (html5QrCode) {
            stopScan();
        }
    });
</script>

<div class="space-y-4">
    {#if !isScanning}
        <Button variant="outline" class="w-full" onclick={startScan}>
            <Camera class="mr-2 h-4 w-4" /> Scan QR Code
        </Button>
    {:else}
        <div class="relative bg-black rounded-lg overflow-hidden border">
            <div id={cameraId} class="w-full aspect-square"></div>
            
            <div class="absolute top-2 right-2 z-10">
                <Button size="icon" variant="destructive" onclick={stopScan}>
                    <X class="h-4 w-4" />
                </Button>
            </div>
            
            {#if error}
                <div class="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center">
                    <div class="space-y-4">
                        <p class="text-white text-sm">{error}</p>
                        <Button size="sm" onclick={stopScan}>Close</Button>
                    </div>
                </div>
            {/if}
        </div>
        <p class="text-xs text-center text-muted-foreground">Align the QR code within the square</p>
    {/if}
</div>
