<script lang="ts">
  import { page } from '$app/stores';
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
  // Mobile sidebar visibility state
  let leftSidebarVisible = $state(false);

  // Toggle folder expansion
  function toggleFolder(path: string) {
    expandedFolders[path] = !expandedFolders[path];
  }
  
  // Toggle left sidebar visibility for mobile view
  function toggleLeftSidebar() {
    leftSidebarVisible = !leftSidebarVisible;
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

  $effect(() => {
    if (typeof window !== 'undefined') {
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
        window.removeEventListener('hashchange', handleHashChange);
        if (window.tocObserver) {
          window.tocObserver.disconnect();
        }
      };
    }
  });
</script>

<div class="layout">
  <header class="header">
    <button 
      class="mobile-toggle" 
      aria-label="Toggle sidebar"
      onclick={toggleLeftSidebar}
    >
      <span class="material-symbols-outlined">menu</span>
    </button>
    <h1>Comentários de João Calvino</h1>
  </header>

  <div class="main-container">
    <nav class="left-sidebar" class:visible={leftSidebarVisible}>
      <div class="sidebar-header">
        <h2>Comentários</h2>
        <button 
          class="close-sidebar" 
          aria-label="Close sidebar"
          onclick={toggleLeftSidebar}
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      {#each data.files as item}
        <div class="file-tree">
          {#if item.isDirectory}
            <div 
              class="file-item folder-item" 
              onclick={() => toggleFolder(item.path)}
              onkeydown={(e) => e.key === 'Enter' && toggleFolder(item.path)}
              tabindex="0"
              role="button"
              aria-expanded={!!expandedFolders[item.path]}
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
                      onclick={() => toggleFolder(childItem.path)}
                      onkeydown={(e) => e.key === 'Enter' && toggleFolder(childItem.path)}
                      tabindex="0"
                      role="button"
                      aria-expanded={!!expandedFolders[childItem.path]}
                    >
                      <span class="material-symbols-outlined">{expandedFolders[childItem.path] ? 'folder_open' : 'folder'}</span>
                      <span class="folder-name">{childItem.name}</span>
                    </div>
                    {#if expandedFolders[childItem.path] && childItem.children && childItem.children.length > 0}
                      <!-- Render nested children recursively -->
                      {#each childItem.children as nestedItem}
                        <div class="file-tree" style="padding-left: 2rem">
                          {#if nestedItem.isDirectory}
                            <!-- If needed, add more levels of nesting here -->
                          {:else}
                            <a href={nestedItem.path} class="file-item file-link">
                              <span class="material-symbols-outlined">description</span>
                              <span>{nestedItem.name}</span>
                            </a>
                          {/if}
                        </div>
                      {/each}
                    {/if}
                  {:else}
                    <a href={childItem.path} class="file-item file-link">
                      <span class="material-symbols-outlined">description</span>
                      <span>{childItem.name}</span>
                    </a>
                  {/if}
                </div>
              {/each}
            {/if}
          {:else}
            <a href={item.path} class="file-item file-link">
              <span class="material-symbols-outlined">description</span>
              <span>{item.name}</span>
            </a>
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
              onclick={(e) => handleTocItemClick(item.id, e)}
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
    position: relative;
  }

  .header h1 {
    margin: 0;
  }

  .mobile-toggle {
    display: none;
    position: absolute;
    left: 1rem;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1.5rem;
    padding: 0.5rem;
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

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .close-sidebar {
    display: none;
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    padding: 0.5rem;
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

  /* Mobile Responsive Design */
  @media (max-width: 768px) {
    .main-container {
      grid-template-columns: 1fr;
    }

    .mobile-toggle {
      display: block;
    }

    .header {
      justify-content: center;
    }

    .left-sidebar {
      position: fixed;
      left: -100%;
      top: var(--header-height);
      width: 80%;
      max-width: 300px;
      z-index: 100;
      transition: left 0.3s ease;
      border-right: 1px solid var(--border-color);
      box-shadow: 2px 0 5px rgba(0,0,0,0.1);
    }

    .left-sidebar.visible {
      left: 0;
    }

    .close-sidebar {
      display: block;
    }

    .right-sidebar {
      display: none;
    }
  }
</style>
