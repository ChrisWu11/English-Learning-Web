import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

const normalizeBase = (base) => {
  if (!base) return '/';
  if (base === '/') return '/';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const basename = normalizeBase(import.meta.env.BASE_URL);

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={basename}>
    <App />
  </BrowserRouter>
);
