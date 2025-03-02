<script lang="ts">
  import { afterUpdate, onMount } from 'svelte';
  import { history } from '../stores/history';
  import { theme } from '../stores/theme';
  import { commands } from '../utils/commands';
  import { track } from '../utils/tracking';

  let command = '';
  let historyIndex = -1;

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
  
  // Update handleKeyDown to reset height after clearing command
  // const handleKeyDown = async (event: KeyboardEvent) => {
  //   // Existing code...
    
  //   if (event.key === 'Enter') {
  //     // Existing code...
      
  //     command = '';
  //     // Reset height after clearing
  //     setTimeout(() => {
  //       if (input) {
  //         input.style.height = 'auto'; // Ok, but redundant now. 
  //         input.style.height = 'calc(1.5em)'; // Approximately one line height
  //       }
  //     }, 0);
  //   }
  // }
    // Rest of existing code...

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
      const [commandName, ...args] = command.split(' ');

      if (import.meta.env.VITE_TRACKING_ENABLED === 'true') {
        track(commandName, ...args);
      }
      if (!commands.hasOwnProperty(commandName)) {
        const output = await commands.ai([command]);
        $history = [...$history, { command, outputs: [output] }];
        command = '';
        return;
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

      command = '';
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
