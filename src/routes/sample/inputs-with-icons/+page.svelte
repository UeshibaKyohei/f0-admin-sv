<script>
  let searchValue = $state('');
  let emailValue = $state('');
  let passwordValue = $state('');
  let phoneValue = $state('');
  let usernameValue = $state('');
  let locationValue = $state('');
</script>

<div class="container mx-auto p-8 max-w-6xl">
  <h1 class="text-3xl font-bold mb-8">DaisyUI v5 - Input Fields with Icons</h1>
  
  <!-- Basic Search Input with Icon -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">1. Basic Search Input with Icon</h2>
    <p class="text-base-content/70 mb-4">
      The official DaisyUI v5 way to add icons to inputs. The parent label uses the 'input' class.
    </p>
    
    <label class="input input-bordered flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 opacity-70">
        <path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" />
      </svg>
      <input type="text" class="grow" placeholder="Search" bind:value={searchValue} />
    </label>
    <p class="text-sm text-base-content/60 mt-2">Current value: {searchValue || '(empty)'}</p>
  </section>

  <!-- Search with Keyboard Shortcut -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">2. Search with Keyboard Shortcuts</h2>
    <p class="text-base-content/70 mb-4">
      Add keyboard shortcut indicators for enhanced UX.
    </p>
    
    <label class="input input-bordered flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 opacity-70">
        <path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" />
      </svg>
      <input type="text" class="grow" placeholder="Search" />
      <kbd class="kbd kbd-sm">⌘</kbd>
      <kbd class="kbd kbd-sm">K</kbd>
    </label>
  </section>

  <!-- Different Input Types with Icons -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">3. Various Input Types with Icons</h2>
    <p class="text-base-content/70 mb-4">
      Different input types with appropriate icons.
    </p>
    
    <div class="space-y-4">
      <!-- Email Input -->
      <label class="input input-bordered flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 opacity-70">
          <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
          <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
        </svg>
        <input type="email" class="grow" placeholder="Email" bind:value={emailValue} />
      </label>

      <!-- Password Input -->
      <label class="input input-bordered flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 opacity-70">
          <path fill-rule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clip-rule="evenodd" />
        </svg>
        <input type="password" class="grow" placeholder="Password" bind:value={passwordValue} />
      </label>

      <!-- Username Input -->
      <label class="input input-bordered flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 opacity-70">
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
        </svg>
        <input type="text" class="grow" placeholder="Username" bind:value={usernameValue} />
      </label>
    </div>
  </section>

  <!-- Input Sizes with Icons -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">4. Different Input Sizes</h2>
    <p class="text-base-content/70 mb-4">
      Icons automatically scale with input size variants.
    </p>
    
    <div class="space-y-4">
      <label class="input input-bordered input-xs flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3 w-3 opacity-70">
          <path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" />
        </svg>
        <input type="text" class="grow" placeholder="Extra small" />
      </label>
      
      <label class="input input-bordered input-sm flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5 opacity-70">
          <path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" />
        </svg>
        <input type="text" class="grow" placeholder="Small" />
      </label>
      
      <label class="input input-bordered input-md flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 opacity-70">
          <path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" />
        </svg>
        <input type="text" class="grow" placeholder="Medium (default)" />
      </label>
      
      <label class="input input-bordered input-lg flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-5 w-5 opacity-70">
          <path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" />
        </svg>
        <input type="text" class="grow" placeholder="Large" />
      </label>
    </div>
  </section>

  <!-- Input with Both Icons -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">5. Input with Icons on Both Sides</h2>
    <p class="text-base-content/70 mb-4">
      You can add icons or elements on both sides of the input.
    </p>
    
    <label class="input input-bordered flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 opacity-70">
        <path d="m8.543 2.232a.75.75 0 0 0-1.085 0l-5.25 5.5A.75.75 0 0 0 2.75 9H4v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V9h1.25a.75.75 0 0 0 .543-1.268l-5.25-5.5Z" />
      </svg>
      <input type="text" class="grow" placeholder="Enter location" bind:value={locationValue} />
      <button class="btn btn-ghost btn-xs">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4">
          <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z" />
          <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z" />
        </svg>
      </button>
    </label>
  </section>

  <!-- Form Control with Label -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">6. Form Control with Label and Icon</h2>
    <p class="text-base-content/70 mb-4">
      Using form-control for proper label positioning with icon inputs.
    </p>
    
    <div class="form-control w-full max-w-xs">
      <label class="label">
        <span class="label-text">What is your phone number?</span>
      </label>
      <label class="input input-bordered flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 opacity-70">
          <path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z" />
        </svg>
        <input type="tel" class="grow" placeholder="+1 (555) 000-0000" bind:value={phoneValue} />
      </label>
      <label class="label">
        <span class="label-text-alt">Enter your phone number with country code</span>
      </label>
    </div>
  </section>

  <!-- Input States with Icons -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">7. Input States with Icons</h2>
    <p class="text-base-content/70 mb-4">
      Different input states maintain icon visibility and positioning.
    </p>
    
    <div class="space-y-4">
      <label class="input input-bordered input-primary flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 opacity-70">
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
        </svg>
        <input type="text" class="grow" placeholder="Primary" />
      </label>
      
      <label class="input input-bordered input-success flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 opacity-70">
          <path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd" />
        </svg>
        <input type="text" class="grow" placeholder="Success" />
      </label>
      
      <label class="input input-bordered input-warning flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 opacity-70">
          <path fill-rule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
        </svg>
        <input type="text" class="grow" placeholder="Warning" />
      </label>
      
      <label class="input input-bordered input-error flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 opacity-70">
          <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
        </svg>
        <input type="text" class="grow" placeholder="Error" />
      </label>
      
      <label class="input input-bordered flex items-center gap-2 input-disabled">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 opacity-70">
          <path fill-rule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z" clip-rule="evenodd" />
        </svg>
        <input type="text" class="grow" placeholder="Disabled" disabled />
      </label>
    </div>
  </section>

  <!-- Best Practices Summary -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">Best Practices Summary</h2>
    <div class="prose max-w-none">
      <ul>
        <li><strong>Parent Structure:</strong> Use <code>&lt;label class="input"&gt;</code> as the parent container</li>
        <li><strong>Icon Sizing:</strong> Use consistent sizing classes like <code>h-4 w-4</code> for icons</li>
        <li><strong>Icon Opacity:</strong> Apply <code>opacity-70</code> to icons for better visual hierarchy</li>
        <li><strong>Input Growth:</strong> Use <code>class="grow"</code> on the input element to fill available space</li>
        <li><strong>Flex Layout:</strong> Add <code>flex items-center gap-2</code> to the parent for proper alignment</li>
        <li><strong>Avoid Deprecated:</strong> Don't use the deprecated <code>input-group</code> component</li>
        <li><strong>Form Controls:</strong> Use <code>form-control</code> wrapper when you need labels above/below the input</li>
        <li><strong>Accessibility:</strong> The label wrapper ensures proper click handling for the entire input area</li>
      </ul>
    </div>
  </section>
</div>