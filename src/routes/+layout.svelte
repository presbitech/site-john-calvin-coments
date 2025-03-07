<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import '../app.css';
  
  // Extend Window interface to include tocObserver
  declare global {
    interface Window {
      tocObserver?: IntersectionObserver;
    }
  }
  
  const { data } = $props<{ data: any }>();
  let contentRef = $state<HTMLElement | null>(null);
  let toc = $state([]);
  let expandedFolders = $state<Record<string, boolean>>({});
  // Track current path for TOC updates
  let currentPath = $state($page.url.pathname);
  // Track active heading
  let activeHeadingId = $state('');

  // Toggle folder expansion
  function toggleFolder(path: string) {
    expandedFolders[path] = !expandedFolders[path];
  }

  // Handle click on TOC item
  function handleTocItemClick(id: string, event: MouseEvent) {
    // Update active heading ID
    activeHeadingId = id;
    
    // Optional: smooth scroll to the heading
    if (event) {
      event.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      // Update URL hash without full page reload
      history.pushState(null, '', `#${id}`);
    }
  }

  // Update TOC when content changes or URL changes
  $effect(() => {
    // Reset TOC when navigating to a different page
    if (currentPath !== $page.url.pathname) {
      toc = [];
      currentPath = $page.url.pathname;
      activeHeadingId = '';
    }

    if (contentRef) {
      // Use a debounced update to ensure content is fully loaded
      const updateToc = () => {
        const headings = contentRef.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length > 0) {
          toc = Array.from(headings).map(heading => ({
            id: heading.id,
            text: heading.textContent || '',
            level: parseInt(heading.tagName[1])
          }));
          
          // Set up intersection observer for headings
          setupIntersectionObserver();
        }
      };

      // Initial update
      updateToc();
      
      // Set up mutation observer to watch for DOM changes in content
      const observer = new MutationObserver(updateToc);
      observer.observe(contentRef, { 
        childList: true, 
        subtree: true, 
        characterData: true 
      });

      // Cleanup function
      return () => observer.disconnect();
    }
  });

  // Set up intersection observer to track which heading is currently visible
  function setupIntersectionObserver() {
    if (!contentRef) return;
    
    const headingElements = contentRef.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headingElements.length === 0) return;
    
    // Disconnect any existing observer
    if (window.tocObserver) {
      window.tocObserver.disconnect();
    }
    
    // Create a new intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that is intersecting
        const visibleHeadings = entries.filter(entry => entry.isIntersecting);
        
        if (visibleHeadings.length > 0) {
          // Use the first visible heading as the active one
          activeHeadingId = visibleHeadings[0].target.id;
        }
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0
      }
    );
    
    // Observe all headings
    headingElements.forEach(heading => {
      observer.observe(heading);
    });
    
    // Store the observer reference
    window.tocObserver = observer;
    
    return () => {
      if (window.tocObserver) {
        window.tocObserver.disconnect();
      }
    };
  }

  // Setup scroll event for updating active heading
  onMount(() => {
    if (typeof window !== 'undefined') {
      setupIntersectionObserver();
      
      // Check if there's a hash in the URL when the page loads
      if (window.location.hash) {
        const hash = window.location.hash.substring(1); // Remove the leading '#'
        activeHeadingId = hash;
        
        // Scroll to the element after a small delay to ensure DOM is fully loaded
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
      
      // Listen for hash changes in the URL
      const handleHashChange = () => {
        if (window.location.hash) {
          const hash = window.location.hash.substring(1);
          activeHeadingId = hash;
        }
      };
      
      window.addEventListener('hashchange', handleHashChange);
      
      return () => {
        if (window.tocObserver) {
          window.tocObserver.disconnect();
        }
        window.removeEventListener('hashchange', handleHashChange);
      };
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
        <div class="toc-container">
          {#each toc as item}
            <a
              href="#{item.id}"
              class={`toc-item ${item.id === activeHeadingId ? 'active' : ''}`}
              style="padding-left: {(item.level - 1) * 1}rem"
              data-level={item.level}
              data-id={item.id}
              on:click={(e) => handleTocItemClick(item.id, e)}
            >
              {item.text}
            </a>
          {/each}
        </div>
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

  .right-sidebar {
    border-left: 1px solid var(--border-color);
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

  .toc-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .toc-item {
    display: block;
    text-decoration: none;
    color: var(--text-color);
    padding: 0.25rem 0;
    font-size: 0.9rem;
    border-left: 2px solid transparent;
    transition: all 0.2s ease;
  }

  .toc-item:hover {
    color: var(--primary-color);
    border-left-color: var(--primary-color);
    background-color: rgba(0, 0, 0, 0.05);
  }

  .toc-item.active {
    color: var(--primary-color);
    border-left-color: var(--primary-color);
    font-weight: bold;
    background-color: rgba(0, 0, 0, 0.05);
  }

  .no-headings {
    font-style: italic;
    color: var(--text-muted);
    font-size: 0.9rem;
  }
</style>
