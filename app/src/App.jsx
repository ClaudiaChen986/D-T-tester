import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EditContacts from './pages/EditContacts';
import Contacts from './pages/Contacts';
import AddContact from './pages/AddContact';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/edit-contacts" element={<EditContacts />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/add-contact" element={<AddContact />} />
    </Routes>
  );
}
