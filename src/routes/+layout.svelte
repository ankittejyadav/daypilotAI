<script>
	import '../app.css';
	import TopAppBar from '$lib/components/TopAppBar.svelte';
	import BottomNavBar from '$lib/components/BottomNavBar.svelte';
	let { children, data } = $props();
</script>

<div class="app-container">
	<TopAppBar user={data.user} />
	<main class="content">
		{@render children()}
	</main>
	<BottomNavBar />
</div>

<style>
	.app-container {
		min-height: 100dvh;
	}

	.content {
		padding-top: 80px;
		padding-bottom: 100px;
		max-width: 48rem;
		margin: 0 auto;
		padding-left: 1.5rem;
		padding-right: 1.5rem;
	}
</style>
