<script lang="ts">
  const { data } = $props<{ data: any }>();
</script>

<div class="markdown-content">
  {@html data.content}
</div>

<style>
  .markdown-content {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
  }
</style>
