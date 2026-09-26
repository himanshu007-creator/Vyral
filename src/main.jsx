import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Landing from './landing/Landing.jsx';
import { Analytics } from '@vercel/analytics/react';

// "/" is the fake store page; "/app" is the phone. The editor bundle only loads on /app.
const App = lazy(() => import('./App.jsx'));
const isApp = location.pathname.replace(/\/$/, '') === '/app';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isApp ? (
      <Suspense fallback={<div style={{ height: '100%', background: '#000' }} />}>
        <App />
      </Suspense>
    ) : (
      <Landing />
    )}
    <Analytics />
  </StrictMode>,
);
