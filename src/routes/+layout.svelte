<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import '../app.css';
  
  const { data } = $props<{ data: any }>();
  let toc = $state([]);

  $effect(() => {
    if (typeof document !== 'undefined') {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      toc = Array.from(headings).map(heading => ({
        id: heading.id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName[1])
      }));
    }
  });
</script>

<div class="layout">
  <header class="header">
    <h1>Comentários de João Calvino</h1>
  </header>

  <div class="main-container">
    <nav class="left-sidebar">
      <h2>Comentários</h2>
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
      <h2>Conteúdo</h2>
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
    background-color: var(--primary-color);
    color: white;
    padding: 1rem;
    text-align: center;
    height: var(--header-height);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .header h1 {
    margin: 0;
  }

  .main-container {
    display: grid;
    grid-template-columns: var(--sidebar-width) 1fr var(--sidebar-width);
    flex: 1;
    gap: 2rem;
  }

  .left-sidebar,
  .right-sidebar {
    padding: 1rem;
    background-color: var(--background-color);
    height: calc(100vh - var(--header-height));
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

  .file-item a {
    color: var(--text-color);
    text-decoration: none;
  }

  .file-item a:hover {
    color: var(--accent-color);
  }

  .toc-item {
    display: block;
    text-decoration: none;
    color: var(--text-color);
    margin: 0.5rem 0;
    transition: color 0.2s ease;
  }

  .toc-item:hover {
    color: var(--accent-color);
  }
</style>
