import { toast } from 'svelte-sonner';

export type NFCStatus = 'idle' | 'scanning' | 'writing' | 'success' | 'error' | 'unsupported';

export function useNFC() {
	let status = $state<NFCStatus>('idle');
	let error = $state<string | null>(null);
    let reader: any = null;

	// Check support
    if (typeof window !== 'undefined' && !('NDEFReader' in window)) {
        status = 'unsupported';
    }

	async function write(content: string) {
		if (status === 'unsupported') {
			toast.error('NFC is not supported on this device/browser.');
			return;
		}

		status = 'scanning';
		error = null;
        
        try {
            // @ts-ignore - NDEFReader is experimentally supported in types or needs generic dom lib
            reader = new NDEFReader();
            
            toast.info('Hold your device near an NFC tag...');
            
            // @ts-ignore
            await reader.write(content);
            
            status = 'success';
            toast.success('Successfully wrote to NFC tag!');
            
        } catch (err) {
            console.error('NFC Write Error:', err);
            status = 'error';
            error = String(err);
            toast.error('Failed to write NFC tag');
        } finally {
            if (status !== 'success' && status !== 'error') {
                 status = 'idle';
            }
            // Reset status after a delay if success
            if (status === 'success') {
                setTimeout(() => { status = 'idle'; }, 3000);
            }
        }
	}

	return {
		get status() { return status; },
		get error() { return error; },
		write
	};
}
