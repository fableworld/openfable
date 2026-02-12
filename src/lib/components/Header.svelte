<script lang="ts">
	import { APP_NAME } from '$lib/constants';
	import { Button } from '$lib/components/ui/button';
	import { Settings } from 'lucide-svelte';
</script>

<header class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
	<div class="container flex h-14 items-center justify-between mx-auto px-4">
		<div class="mr-4 hidden md:flex">
			<a class="mr-6 flex items-center space-x-2" href="/">
				<span class="hidden font-bold sm:inline-block">{APP_NAME}</span>
			</a>
		</div>
        <div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
             <div class="w-full flex-1 md:w-auto md:flex-none">
                <a class="mr-6 flex items-center space-x-2 md:hidden" href="/">
                    <span class="font-bold inline-block">{APP_NAME}</span>
                </a>
             </div>
             <nav class="flex items-center">
                <Button variant="ghost" size="icon" href="/settings">
                    <Settings class="h-4 w-4" />
                    <span class="sr-only">Settings</span>
                </Button>
             </nav>
        </div>
	</div>
</header>
