import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ContactsProvider } from './lib/contactsStore.jsx';
import './styles/styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ContactsProvider>
        <App />
      </ContactsProvider>
    </BrowserRouter>
  </StrictMode>,
);
