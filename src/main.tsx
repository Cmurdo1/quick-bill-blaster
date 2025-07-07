
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Main.tsx loading...');

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container not found");
}

console.log('Creating React root...');
const root = createRoot(container);

console.log('Rendering App...');
try {
  root.render(<App />);
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error rendering app:', error);
}
