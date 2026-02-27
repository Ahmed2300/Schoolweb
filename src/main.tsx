import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { queryClient } from './lib/react-query';
// Initialize OneSignal but defer it — dynamic import ensures the module
// itself doesn't load until the browser is idle (improves TBT / unused JS)
if (typeof window !== 'undefined') {
  const loadOneSignal = () => {
    import('./initOneSignal').then(({ initOneSignal }) => initOneSignal());
  };
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadOneSignal);
  } else {
    setTimeout(loadOneSignal, 3000);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
)
