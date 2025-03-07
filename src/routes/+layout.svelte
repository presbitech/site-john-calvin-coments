<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import '../app.css';
  
  const { data } = $props<{ data: any }>();
  let contentRef = $state<HTMLElement | null>(null);
  let toc = $state([]);
  let expandedFolders = $state<Record<string, boolean>>({});

  // Toggle folder expansion
  function toggleFolder(path: string) {
    expandedFolders[path] = !expandedFolders[path];
  }

  // Update TOC when content changes
  $effect(() => {
    if (contentRef) {
      setTimeout(() => {
        const headings = contentRef.querySelectorAll('h1, h2, h3, h4, h5, h6');
        toc = Array.from(headings).map(heading => ({
          id: heading.id,
          text: heading.textContent || '',
          level: parseInt(heading.tagName[1])
        }));
      }, 100); // Small delay to ensure content is fully rendered
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
      {#each data.files as item}
        <div class="file-tree">
          {#if item.isDirectory}
            <div 
              class="file-item folder-item" 
              on:click={() => toggleFolder(item.path)}
              on:keydown={(e) => e.key === 'Enter' && toggleFolder(item.path)}
              tabindex="0"
            >
              <span class="material-symbols-outlined">{expandedFolders[item.path] ? 'folder_open' : 'folder'}</span>
              <span class="folder-name">{item.name}</span>
            </div>
            {#if expandedFolders[item.path] && item.children && item.children.length > 0}
              {#each item.children as childItem}
                <div class="file-tree" style="padding-left: 1rem">
                  {#if childItem.isDirectory}
                    <div 
                      class="file-item folder-item" 
                      on:click={() => toggleFolder(childItem.path)}
                      on:keydown={(e) => e.key === 'Enter' && toggleFolder(childItem.path)}
                      tabindex="0"
                    >
                      <span class="material-symbols-outlined">{expandedFolders[childItem.path] ? 'folder_open' : 'folder'}</span>
                      <span class="folder-name">{childItem.name}</span>
                    </div>
                    {#if expandedFolders[childItem.path] && childItem.children && childItem.children.length > 0}
                      {#each childItem.children as grandChildItem}
                        <div class="file-tree" style="padding-left: 2rem">
                          {#if grandChildItem.isDirectory}
                            <div 
                              class="file-item folder-item" 
                              on:click={() => toggleFolder(grandChildItem.path)}
                              on:keydown={(e) => e.key === 'Enter' && toggleFolder(grandChildItem.path)}
                              tabindex="0"
                            >
                              <span class="material-symbols-outlined">{expandedFolders[grandChildItem.path] ? 'folder_open' : 'folder'}</span>
                              <span class="folder-name">{grandChildItem.name}</span>
                            </div>
                            {#if expandedFolders[grandChildItem.path] && grandChildItem.children && grandChildItem.children.length > 0}
                              <!-- Additional levels could be added here but for simplicity we'll stop at 3 levels -->
                              {#each grandChildItem.children as greatGrandChildItem}
                                <div class="file-item" style="padding-left: 3rem">
                                  {#if greatGrandChildItem.isDirectory}
                                    <!-- More levels could go here -->
                                  {:else}
                                    <a href={greatGrandChildItem.path} class="file-link">
                                      <span class="material-symbols-outlined">docs</span>
                                      <span class="file-name">{greatGrandChildItem.name}</span>
                                    </a>
                                  {/if}
                                </div>
                              {/each}
                            {/if}
                          {:else}
                            <a href={grandChildItem.path} class="file-link">
                              <span class="material-symbols-outlined">docs</span>
                              <span class="file-name">{grandChildItem.name}</span>
                            </a>
                          {/if}
                        </div>
                      {/each}
                    {/if}
                  {:else}
                    <a href={childItem.path} class="file-link">
                      <span class="material-symbols-outlined">docs</span>
                      <span class="file-name">{childItem.name}</span>
                    </a>
                  {/if}
                </div>
              {/each}
            {/if}
          {:else}
            <div class="file-item">
              <a href={item.path} class="file-link">
                <span class="material-symbols-outlined">docs</span>
                <span class="file-name">{item.name}</span>
              </a>
            </div>
          {/if}
        </div>
      {/each}
    </nav>

    <main class="content" bind:this={contentRef}>
      <slot />
    </main>

    <nav class="right-sidebar">
      <h2>Conteúdo</h2>
      {#if toc.length > 0}
        {#each toc as item}
          <a
            href="#{item.id}"
            class="toc-item"
            style="padding-left: {(item.level - 1) * 1}rem"
          >
            {item.text}
          </a>
        {/each}
      {:else}
        <p class="no-headings">Nenhum cabeçalho encontrado</p>
      {/if}
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

  .file-tree {
    margin: 0.25rem 0;
  }

  .file-item {
    margin: 0.25rem 0;
  }

  .folder-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  .folder-item:hover {
    color: var(--accent-color);
  }

  .folder-icon,
  .file-icon {
    margin-right: 0.5rem;
  }

  .file-link {
    display: flex;
    align-items: center;
    color: var(--text-color);
    text-decoration: none;
  }

  .file-link:hover {
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

  .no-headings {
    font-style: italic;
    color: #888;
  }
</style>
