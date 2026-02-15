<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="card"
	class={cn(
		"bg-card text-card-foreground flex flex-col rounded-2xl border shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-indigo-500/10 hover:shadow-xl",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
