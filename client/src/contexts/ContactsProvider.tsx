import * as React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

interface Contact {
  id: string;
  name: string;
}

interface ContactsContextInterface {
  contacts: Contact[];
  createContact: (contact: Contact) => void;
}

const { useContext } = React;

const ContactsContext = React.createContext<ContactsContextInterface>({
  contacts: [],
  createContact: () => {},
});

export function useContacts() {
  return useContext(ContactsContext);
}

export const ContactsProvider: React.FC = ({ children }) => {
  const [contacts, setContacts] = useLocalStorage<Contact[]>('contacts', []);

  function createContact(contact: Contact) {
    const { id, name } = contact;
    setContacts((prevContacts) => {
      return [...prevContacts, { id, name }];
    });
  }

  return (
    <ContactsContext.Provider value={{ contacts, createContact }}>
      {children}
    </ContactsContext.Provider>
  );
};
