import * as React from 'react';
import { ListGroup } from 'react-bootstrap';
import { useContacts } from '../contexts/ContactsProvider';

interface Contact {
  id: string;
  name: string;
}

const Contacts: React.FC = () => {
  const { contacts } = useContacts();

  return (
    <ListGroup variant="flush">
      {contacts.map((contact: Contact) => (
        <ListGroup.Item key={contact.id}>{contact.name}</ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default Contacts;
