<script lang="ts">
    export let data;
</script>

<div class="markdown-wrapper">
  {@html data.content}
</div>

<style>
  .markdown-wrapper {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
  }

  .markdown-wrapper :global(pre) {
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
  }

  .markdown-wrapper :global(code) {
    font-family: 'Fira Code', monospace;
  }
</style>
