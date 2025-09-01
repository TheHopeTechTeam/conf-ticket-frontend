import { createRoot } from 'react-dom/client';
import AppRouter from './Router';
import './style.scss';

createRoot(document.getElementById('root')!).render(<AppRouter />);
