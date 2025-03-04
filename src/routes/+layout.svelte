<script lang="ts">
  import { page } from '$app/stores';
  export let data;

  $: toc = [];
  $: {
    if (typeof document !== 'undefined') {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      toc = Array.from(headings).map(heading => ({
        id: heading.id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName[1])
      }));
    }
  }
</script>

<div class="layout">
  <header class="header">
    <h1>Documentation Site</h1>
  </header>

  <div class="main-container">
    <nav class="left-sidebar">
      <h2>Files</h2>
      {#each data.files as file}
        <div class="file-item" style="padding-left: {file.isDirectory ? '0' : '1rem'}">
          {#if file.isDirectory}
            📁 {file.name}
          {:else}
            📄 <a href={file.path}>{file.name}</a>
          {/if}
        </div>
      {/each}
    </nav>

    <main class="content">
      <slot />
    </main>

    <nav class="right-sidebar">
      <h2>Table of Contents</h2>
      {#each toc as item}
        <a
          href="#{item.id}"
          class="toc-item"
          style="padding-left: {(item.level - 1) * 1}rem"
        >
          {item.text}
        </a>
      {/each}
    </nav>
  </div>
</div>

<style>
  .layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .header {
    background-color: #2c3e50;
    color: white;
    padding: 1rem;
    text-align: center;
  }

  .main-container {
    display: grid;
    grid-template-columns: 250px 1fr 250px;
    flex: 1;
    gap: 2rem;
  }

  .left-sidebar, .right-sidebar {
    padding: 1rem;
    background-color: #f8f9fa;
    height: calc(100vh - 4rem);
    position: sticky;
    top: 0;
    overflow-y: auto;
  }

  .content {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .file-item {
    margin: 0.5rem 0;
  }

  .toc-item {
    display: block;
    text-decoration: none;
    color: #333;
    margin: 0.5rem 0;
  }

  .toc-item:hover {
    color: #007bff;
  }

  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
</style>
