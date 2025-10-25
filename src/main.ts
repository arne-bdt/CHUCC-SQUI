// Carbon Design System styles
import 'carbon-components-svelte/css/white.css';
import 'carbon-components-svelte/css/g10.css';
import 'carbon-components-svelte/css/g90.css';
import 'carbon-components-svelte/css/g100.css';

// App styles
import './app.css';
import App from './App.svelte';

const app = new App({
  target: document.getElementById('app')!,
});

export default app;
