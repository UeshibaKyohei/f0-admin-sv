# DaisyUI v5 Left-Aligned Dashboard Layout Recommendations

## 1. Modify Main Layout (+layout.svelte)

Replace lines 190-193 with one of these options:

### Option A: Full Width Layout (Recommended)

```svelte
<!-- Remove container constraints for full width -->
<main class="bg-base-200/30 flex-grow">
	{@render children()}
</main>
```

### Option B: Minimal Padding Layout

```svelte
<!-- Keep some structure but minimize padding -->
<main class="bg-base-200/30 flex-grow p-1 md:p-2">
	<div class="w-full">
		{@render children()}
	</div>
</main>
```

### Option C: Asymmetric Padding (Left-aligned focus)

```svelte
<!-- More padding on right than left -->
<main class="bg-base-200/30 flex-grow py-4 pr-4 pl-0 md:py-6 md:pr-6 md:pl-0">
	{@render children()}
</main>
```

## 2. Dashboard Page Optimization (+page.svelte)

### Minimal Padding Approach:

```svelte
<div class="bg-base-100 min-h-screen">
	<!-- タイトル - No left padding -->
	<div class="bg-base-100 pt-4">
		<h1 class="text-2xl font-bold">プロジェクト管理</h1>
	</div>

	<!-- ヘッダー - Minimal left padding -->
	<div class="bg-base-100 border-base-300 mt-2 border-b">
		<div class="py-3 pr-4 pl-1">
			<!-- content -->
		</div>
	</div>

	<!-- メインコンテンツ - No left padding -->
	<div class="bg-base-200 py-4 pr-4">
		<!-- content -->
	</div>
</div>
```

### Using Tailwind Arbitrary Values:

```svelte
<!-- Ultra-minimal 2px padding -->
<div class="py-3 pr-4 pl-[2px]">
	<!-- content -->
</div>

<!-- Or 4px for slightly more breathing room -->
<div class="py-3 pr-4 pl-[4px]">
	<!-- content -->
</div>
```

## 3. Responsive Considerations

For mobile devices, you might want to keep some padding:

```svelte
<!-- No padding on large screens, minimal on mobile -->
<div class="py-4 pr-4 pl-2 lg:pl-0">
	<!-- content -->
</div>

<!-- Or use container-fluid pattern -->
<div class="container-fluid px-2 lg:px-0">
	<!-- content -->
</div>
```

## 4. Grid-Based Layout Alternative

If using grid layouts, you can control spacing more precisely:

```svelte
<div class="grid grid-cols-12 gap-0 lg:gap-2">
	<div class="col-span-12 lg:col-start-1">
		<!-- Content starts from the very first column -->
	</div>
</div>
```

## 5. Component-Level Adjustments

For cards and other components, remove or minimize their internal padding:

```svelte
<!-- Standard DaisyUI card -->
<div class="card bg-base-100 p-6">

<!-- Minimal padding card -->
<div class="card bg-base-100 p-2">

<!-- No padding card -->
<div class="card bg-base-100 p-0">
```

## Key DaisyUI v5 Utilities for Spacing

- `p-0` - 0px padding
- `p-0.5` - 2px padding
- `p-1` - 4px padding (0.25rem)
- `p-2` - 8px padding (0.5rem)
- `pl-[Xpx]` - Arbitrary value for exact pixel control
- `container-fluid` - Full width container
- `w-full` - Full width
- `max-w-none` - Remove max-width constraints

## Best Practice Summary

1. **Remove the `max-w-7xl mx-auto` wrapper** in the main layout
2. **Use `pl-0` or `pl-1`** instead of `pl-2` for tighter alignment
3. **Consider asymmetric padding** (less on left, more on right)
4. **Use Tailwind arbitrary values** like `pl-[2px]` for pixel-perfect control
5. **Test on multiple screen sizes** to ensure responsive behavior
6. **Keep accessibility in mind** - some padding helps with touch targets

The key is balancing visual density with usability. DaisyUI v5 is built on Tailwind CSS v4, so all Tailwind utilities are available for precise spacing control.
