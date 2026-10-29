import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces';
import './styles/index.css';
import { router } from './app/router';
import { ToastProvider } from './components/ui/Toast';
import { loadAll } from './lib/store';

void loadAll();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </React.StrictMode>
);
