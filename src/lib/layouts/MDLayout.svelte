<script>
  // Your frontmatter will be available as props
</script>

<div class="markdown-content">
  <slot />
</div>

<style>
  .markdown-content {
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: #333;
  }

  .markdown-content :global(h1) {
    font-size: 2.5rem;
    margin-top: 2rem;
    margin-bottom: 1.5rem;
    font-weight: 700;
  }

  .markdown-content :global(h2) {
    font-size: 2rem;
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .markdown-content :global(h3) {
    font-size: 1.75rem;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }

  .markdown-content :global(p) {
    margin: 1rem 0;
  }

  .markdown-content :global(a) {
    color: #0066cc;
    text-decoration: none;
  }

  .markdown-content :global(a:hover) {
    text-decoration: underline;
  }

  .markdown-content :global(code) {
    background-color: #f5f5f5;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Fira Code', 'Consolas', monospace;
  }

  .markdown-content :global(pre) {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 5px;
    overflow-x: auto;
  }

  .markdown-content :global(pre code) {
    background-color: transparent;
    padding: 0;
  }

  .markdown-content :global(ul), .markdown-content :global(ol) {
    margin: 1rem 0;
    padding-left: 2rem;
  }

  .markdown-content :global(li) {
    margin: 0.5rem 0;
  }

  .markdown-content :global(blockquote) {
    border-left: 4px solid #ddd;
    margin: 1rem 0;
    padding-left: 1rem;
    color: #666;
  }

  .markdown-content :global(img) {
    max-width: 100%;
    height: auto;
  }

  .markdown-content :global(hr) {
    border: none;
    border-top: 1px solid #ddd;
    margin: 2rem 0;
  }

  .markdown-content :global(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 1rem 0;
  }

  .markdown-content :global(th), .markdown-content :global(td) {
    border: 1px solid #ddd;
    padding: 0.5rem;
    text-align: left;
  }

  .markdown-content :global(th) {
    background-color: #f5f5f5;
  }
</style>
