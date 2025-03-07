<script lang="ts">
  const { data } = $props<{ data: any }>();
</script>

<h1>Comentarios Bíblicos de João Calvino</h1>

<div class="content">
  <div class="file-grid">
    {#each data.files as file}
      <a href={file.path} class="file-card">
        <div class="icon">{#if file.isDirectory} 
          <span class="material-symbols-outlined">folder</span> 
          {:else} 
          <span class="material-symbols-outlined">description</span>
          {/if}</div>
        <div class="name">{file.name}</div>
      </a>
    {/each}
  </div>
</div>

<style>
  .content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
  }

  .file-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
  }

  .file-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .name {
    text-align: center;
    word-break: break-word;
  }
</style>
