// src/index.tsx
import React from 'react';
import App from './App';
import { createRoot } from 'react-dom/client';
const container = document.getElementById('app') as HTMLElement;
const root = createRoot(container!);
root.render(<React.StrictMode><App /></React.StrictMode>);