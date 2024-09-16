import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'primereact/resources/themes/saga-blue/theme.css'; // Or any other PrimeReact theme you're using
import 'primereact/resources/primereact.min.css';
// import 'primeicons/primeicons.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
