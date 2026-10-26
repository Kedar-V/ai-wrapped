import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { syncFromHash } from './hooks';
import './styles.css';

syncFromHash();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
