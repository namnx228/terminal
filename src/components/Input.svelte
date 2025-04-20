<script lang="ts">
  import { afterUpdate, onMount } from 'svelte';
  import { history } from '../stores/history';
  import { theme } from '../stores/theme';
  import { commands } from '../utils/commands';
  import { track } from '../utils/tracking';
  import { createEventDispatcher } from 'svelte';

  let command = '';
  let historyIndex = -1;
  let isLoading = false; // Add loading state variable

  const dispatch = createEventDispatcher(); // To notify parent (App.svelte) about loading state

  let input: HTMLTextAreaElement; // Existing declaration

  // Add this function to handle auto-resizing
  const autoResize = () => {
    if (!input) return;
    
    // Set height based on the scrollHeight (content height)
    input.style.height = `${input.scrollHeight}px`;
  };
  
  // Add a reactive statement to call autoResize when command changes
  $: if (input && command) {
    // Use setTimeout to ensure DOM is updated
    setTimeout(autoResize, 0);
  }
  
  // Modify the existing afterUpdate function to also handle resizing
  afterUpdate(() => {
    input.scrollIntoView({ behavior: 'smooth', block: 'end' });
    autoResize();
  });
  
  onMount(() => {
    input.focus();

    if ($history.length === 0) {
      const command = commands['banner'] as () => string;

      if (command) {
        const output = command();

        $history = [...$history, { command: 'banner', outputs: [output] }];
      }
    }
  });

  afterUpdate(() => {
    input.scrollIntoView({ behavior: 'smooth', block: 'end' });
  });

  const handleKeyDown = async (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const [commandName, ...args] = command.split(' ');

      if (import.meta.env.VITE_TRACKING_ENABLED === 'true') {
        track(commandName, ...args);
      }
      if (!commands.hasOwnProperty(commandName)) {
        const previous_command = command;
        command = ''; // Clear input immediately

        // Define loading message and entry
        const loadingMessage = '#########\nLoading Ai response...\n#########';
        // Use previous_command, add type: '__LOADING__'
        const loadingEntry = { command: previous_command, outputs: [loadingMessage], type: '__LOADING__' };

        // Add temporary loading entry to history
        $history = [...$history, loadingEntry];

        // Set loading state to true and dispatch event
        isLoading = true;
        dispatch('loading', { status: isLoading });

        // Fetch AI response
        const output = await commands.ai([previous_command]);

        // Remove temporary loading entry by checking type
        $history = $history.filter(entry => entry.type !== '__LOADING__');

        // Set loading state to false and dispatch event
        isLoading = false;
        dispatch('loading', { status: isLoading });

        // Add final history entry (no type needed here)
        $history = [...$history, { command: previous_command, outputs: [output] }];

        return; // Exit after handling AI command
      }
      const commandFunction = commands[commandName];

      if (commandFunction) {
        const output = await commandFunction(args);

        if (commandName !== 'clear') {
          $history = [...$history, { command, outputs: [output] }];
        }
      } else {
        const output = `${commandName}: command not found`;

        $history = [...$history, { command, outputs: [output] }];
      }

      command = "";

    } else if (event.key === 'ArrowUp') {
      if (historyIndex < $history.length - 1) {
        historyIndex++;

        command = $history[$history.length - 1 - historyIndex].command;
      }

      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      if (historyIndex > -1) {
        historyIndex--;
        command =
          historyIndex >= 0
            ? $history[$history.length - 1 - historyIndex].command
            : '';
      }
      event.preventDefault();
    } else if (event.key === 'Tab') {
      event.preventDefault();

      const autoCompleteCommand = Object.keys(commands).find((cmd) =>
        cmd.startsWith(command),
      );

      if (autoCompleteCommand) {
        command = autoCompleteCommand;
      }
    } else if (event.ctrlKey && event.key === 'l') {
      event.preventDefault();

      $history = [];
    }
  };
</script>

<svelte:window on:click={(event) => {
  const selection = window.getSelection(); 
  if (!selection || selection.toString().length === 0) 
  {
    input.focus(); 
  }}} />

<!-- Conditionally render the input section  -->
{#if !isLoading} 
<div class="flex w-full">
  <p class="visible md:hidden">❯</p>

  <textarea
  id="command-input"
  name="command-input"
  aria-label="Command input"
  class="w-full px-2 bg-transparent outline-none resize-none overflow-hidden"
  rows="1"
  style={`color: ${$theme.foreground}`}
  bind:value={command}
  on:keydown={handleKeyDown}
  bind:this={input}
  ></textarea>
</div>
<!-- End conditional rendering  -->
{/if} 
