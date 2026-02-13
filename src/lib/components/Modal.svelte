<script lang="ts">
	let { open = $bindable(false), title, children } = $props();

	function close() {
		open = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- backdrop -->
	<div 
		class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" 
		onclick={close}
        aria-hidden="true"
	></div>

	<!-- modal -->
	<div class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full">
		<div class="flex flex-col space-y-1.5 text-center sm:text-left">
			<h2 class="text-lg font-semibold leading-none tracking-tight">{title}</h2>
		</div>
		
		<div class="relative">
			{@render children()}
		</div>

		<button 
			class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
			onclick={close}
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
			<span class="sr-only">Close</span>
		</button>
	</div>
{/if}
