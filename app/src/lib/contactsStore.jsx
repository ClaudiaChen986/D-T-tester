import { createContext, useCallback, useContext, useState } from 'react';

const STORAGE_KEY = 'guitu.contacts';

function readStoredContacts() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeStoredContacts(contacts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    return true;
  } catch {
    return false;
  }
}

const ContactsContext = createContext(null);

/**
 * Holds every user-added contact (not the Figma seed contacts — those are
 * static constants rendered alongside these, see seedContacts.js) for the
 * lifetime of the app session, backed by localStorage.
 *
 * In-memory state is the source of truth, localStorage is a best-effort
 * persistence layer underneath it — not the other way around. That split
 * matters: some browsers (Firefox, notably) disable localStorage entirely
 * for pages loaded without a real server, and even served over http(s) a
 * user can have it blocked. Routing every read through Context means Save
 * always works *this session* regardless of whether the write beneath it
 * succeeded; only surviving a later full reload depends on that write.
 */
export function ContactsProvider({ children }) {
  const [contacts, setContacts] = useState(readStoredContacts);
  const [persisted, setPersisted] = useState(true);

  const addContact = useCallback((contact) => {
    setContacts((prev) => {
      const next = [...prev, contact];
      setPersisted(writeStoredContacts(next));
      return next;
    });
  }, []);

  return (
    <ContactsContext.Provider value={{ contacts, addContact, persisted }}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContactsStore() {
  const ctx = useContext(ContactsContext);
  if (!ctx) throw new Error('useContactsStore must be used within a ContactsProvider');
  return ctx;
}
