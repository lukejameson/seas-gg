<script>
	export let data;
	const { tide } = data;
</script>


<div>
    {#if tide}
        <div>{tide.date}</div>
    {/if}
</div>