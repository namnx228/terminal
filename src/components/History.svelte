<script lang="ts">
  import { history } from '../stores/history';
  import { theme } from '../stores/theme';
  import Ps1 from './Ps1.svelte';
</script>

{#each $history as entry}
  {#if entry.type === '__LOADING__'}
    <!-- Render loading state: PS1, original command, then loading message -->
    <div style={`color: ${$theme.foreground}`}>
      <div class="flex flex-col md:flex-row"> 
        <Ps1 />
        <div class="flex">
          <p class="visible md:hidden">❯</p>
          <p class="px-2">{entry.command}</p> 
        </div>
      </div>
      {#each entry.outputs as output} 
        <p class="whitespace-pre-wrap">
          {output} 
        </p>
      {/each}
    </div>
  {:else}
    <!-- Render regular history entry -->
    <div style={`color: ${$theme.foreground}`}>
      <div class="flex flex-col md:flex-row">
        <Ps1 />

        <div class="flex">
          <p class="visible md:hidden">❯</p>

          <p class="px-2">{entry.command}</p>
        </div>
      </div>

      {#each entry.outputs as output}
        <p class="whitespace-pre-wrap">
          {output}
        </p>
      {/each}
    </div>
  {/if}
{/each}
