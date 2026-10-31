import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces';
import 'app-skins/skins.css';
import './styles/index.css';
import { router } from './app/router';
import { ToastProvider } from './components/ui/Toast';
import { getSettings, loadAll } from './lib/store';
import { applyLook } from './components/shell';

// apply a saved Look before the first render so a skinned page does not flash the default colours
const initial = getSettings();
if (initial.skin) applyLook(initial.theme, initial.skin);

void loadAll();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </React.StrictMode>
);
