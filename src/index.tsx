// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createRoot } from 'react-dom/client';
const container = document.getElementById('app') as HTMLElement;
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App />);