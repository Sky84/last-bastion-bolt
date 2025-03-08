import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import toast from 'react-hot-toast'; // Import toast

// Global error handler for uncaught exceptions
window.onerror = (message, source, lineno, colno, error) => {
  toast.error(`Global Error: ${message}`, { duration: 5000 });
  console.error('Global error caught:', message, source, lineno, colno, error);
  return true; // Prevent default error handling
};

// Global error handler for unhandled promise rejections
window.onunhandledrejection = (event: PromiseRejectionEvent) => {
  toast.error(`Promise Rejection: ${event.reason}`, { duration: 5000 });
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent default rejection handling
};


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
