<script lang="ts">
    import { House, Scan, Settings, Search } from 'lucide-svelte';
    import { page } from '$app/state';
    import { cn } from '$lib/utils';
    import { onMount } from 'svelte';

    let isVisible = $state(true);
    let lastScrollY = $state(0);

    function handleScroll() {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            isVisible = false;
        } else {
            isVisible = true;
        }
        lastScrollY = currentScrollY;
    }

    onMount(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    });

    const items = [
        { href: '/', icon: House, label: 'Home' },
        { href: '/scan', icon: Scan, label: 'Scan' },
        { href: '/settings', icon: Settings, label: 'Settings' }
    ];
</script>

<nav 
    class={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-transform duration-300 ease-in-out",
        !isVisible && "translate-y-24"
    )}
>
    <div class="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-full px-6 py-3 flex items-center gap-8 shadow-lg border border-white/20 dark:border-slate-800/50">
        {#each items as item}
            {@const active = page.url.pathname === item.href}
            <a 
                href={item.href} 
                class={cn(
                    "relative flex flex-col items-center gap-1 transition-colors",
                    active ? "text-brand-indigo" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                )}
            >
                <item.icon class="size-6" strokeWidth={active ? 2.5 : 2} />
                {#if active}
                    <div class="absolute -bottom-1.5 size-1 rounded-full bg-spark-teal animate-in fade-in zoom-in duration-300"></div>
                {/if}
                <span class="sr-only">{item.label}</span>
            </a>
        {/each}
    </div>
</nav>

<style>
    /* Ensure touch target size */
    a {
        min-width: 48px;
        min-height: 48px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
