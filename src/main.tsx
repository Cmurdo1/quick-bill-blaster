
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
root.render(<App />);
