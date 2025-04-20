<script lang="ts">
  import Ps1 from './components/Ps1.svelte';
  import Input from './components/Input.svelte';
  import History from './components/History.svelte';
  import { theme } from './stores/theme';

  let isInputLoading = false; // State to track loading status from Input

  // Handler for the 'loading' event from Input.svelte
  const handleLoading = (event: CustomEvent<{ status: boolean }>) => {
    isInputLoading = event.detail.status;
  };
</script>

<svelte:head>
  {#if import.meta.env.VITE_TRACKING_ENABLED === 'true'}
    <script
      async
      defer
      data-website-id={import.meta.env.VITE_TRACKING_SITE_ID}
      src={import.meta.env.VITE_TRACKING_URL}
    ></script>
  {/if}
</svelte:head>

<main
  class="h-full border-2 rounded-md p-4 overflow-auto text-xs sm:text-sm md:text-base"
  style={`background-color: ${$theme.background}; color: ${$theme.foreground}; border-color: ${$theme.green};`}
>
   <History />

  <!-- Conditionally render the prompt and input section -->
  {#if !isInputLoading} 
  <div class="flex flex-col md:flex-row">
    <Ps1 />

    <!-- Listen for the loading event -->
    <Input on:loading={handleLoading} /> 
  </div>
  {/if}
</main>
