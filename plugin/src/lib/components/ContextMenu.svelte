<script lang="ts">
	// Adapted from https://svelte.dev/repl/6fb90919e24942b2b47d9ad154386b0c?version=3.49.0

	// pos is cursor position when right click occur
	let pos = { x: 0, y: 0 };
	// menu is dimension (height and width) of context menu
	let menu = { h: 0, w: 0 };
	// browser/window dimension (height and width)
	let browser = { h: 0, w: 0 };
	// showMenu is state of context-menu visibility
	let showMenu = false;

	function contextMenu(e: MouseEvent) {
        if (showMenu) {
            showMenu = false;
            return;
        }
		showMenu = true;
		browser = { w: window.innerWidth, h: window.innerHeight };
		pos = { x: e.clientX, y: e.clientY };
		if (browser.h - pos.y < menu.h) pos.y = pos.y - menu.h;
		if (browser.w - pos.x < menu.w) pos.x = pos.x - menu.w;
	}

	function pageClick(e: MouseEvent) {
		if (!container?.contains(e.target as Node)) showMenu = false;
	}

    $: if (showMenu) {
        window.addEventListener("click", pageClick)
        console.log("Added event listener")
    } else {
        window.removeEventListener("click", pageClick)
        console.log("Removed event listener")
    }   

	function getContextMenuDimension(node: HTMLDivElement) {
		// This function will get context menu dimension
		// when navigation is shown => showMenu = true
		let height = node.offsetHeight;
		let width = node.offsetWidth;
		menu = {
			h: height,
			w: width
		};
	}

    function teleport(node: HTMLDivElement) {
        node.parentElement?.removeChild(node)
        document.body.appendChild(node)
    }

	let container: HTMLDivElement;
</script>


<button on:contextmenu|preventDefault={contextMenu} on:click={() => (showMenu = false)}>
	<slot name="handle" />
</button>

{#if showMenu}
	<div bind:this={container} use:getContextMenuDimension use:teleport class="absolute px-2 py-1 rounded bg-gray-200" style="top: {pos.y}px; left: {pos.x}px;">
		<slot />
	</div>
{/if}
