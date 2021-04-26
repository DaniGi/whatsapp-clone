import * as React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useContacts } from './ContactsProvider';
import { useSocket } from './SocketProvider';

const { useContext, useState, useEffect, useCallback } = React;

interface Props {
  id: string;
}

interface Message {
  sender: string;
  text: string;
}
interface Conversation {
  messages: Message[];
  recipients: string[];
}

type FormattedMessage = Message & {
  senderName: string;
  fromMe: boolean;
};

interface FormattedConversationInterface {
  messages: FormattedMessage[];
  recipients: {
    id: string;
    name: string;
  }[];
  selected: boolean;
}

interface ConversationsContextInterface {
  conversations: FormattedConversationInterface[];
  selectedConversation: FormattedConversationInterface;
  sendMessage: (recipients: string[], text: string) => void;
  selectConversationIndex: React.Dispatch<React.SetStateAction<number>>;
  createConversation: (recipients: string[]) => void;
}

const ConversationsContext = React.createContext<ConversationsContextInterface>({
  conversations: [],
  selectedConversation: { messages: [], recipients: [], selected: false },
  sendMessage: () => {},
  selectConversationIndex: () => {},
  createConversation: () => {},
});

export function useConversations() {
  return useContext(ConversationsContext);
}

export const ConversationsProvider: React.FC<Props> = ({ id, children }) => {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('conversations', []);
  const [selectedConversationIndex, setSelectedConversationIndex] = useState(0);
  const { contacts } = useContacts();
  const socket = useSocket();

  function createConversation(recipients: string[]) {
    setConversations((prevConversations) => {
      return [...prevConversations, { recipients, messages: [] }];
    });
  }

  const addMessageToConversation = useCallback(
    ({ recipients, text, sender }) => {
      setConversations((prevConversations) => {
        let madeChange = false;
        const newMessage = { sender, text };
        const newConversations = prevConversations.map((conversation) => {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          if (arrayEquality(conversation.recipients, recipients)) {
            madeChange = true;
            return {
              ...conversation,
              messages: [...conversation.messages, newMessage],
            };
          }

          return conversation;
        });

        if (madeChange) {
          return newConversations;
        }
        return [...prevConversations, { recipients, messages: [newMessage] }];
      });
    },
    [setConversations],
  );

  useEffect(() => {
    if (socket == null) return;

    socket.on('receive-message', addMessageToConversation);

    // eslint-disable-next-line consistent-return
    return () => {
      socket.off('receive-message');
    };
  }, [socket, addMessageToConversation]);

  function sendMessage(recipients: string[], text: string) {
    if (socket) socket.emit('send-message', { recipients, text });

    addMessageToConversation({ recipients, text, sender: id });
  }

  const formattedConversations = conversations.map((conversation, index) => {
    const recipients = conversation.recipients.map((recipient) => {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const contact = contacts.find((contact) => {
        return contact.id === recipient;
      });
      const name = (contact && contact.name) || recipient;
      return { id: recipient, name };
    });

    const messages = conversation.messages.map((message) => {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const contact = contacts.find((contact) => {
        return contact.id === message.sender;
      });
      const name = (contact && contact.name) || message.sender;
      const fromMe = id === message.sender;
      return { ...message, senderName: name, fromMe };
    });

    const selected = index === selectedConversationIndex;
    return { ...conversation, messages, recipients, selected };
  });

  const value = {
    conversations: formattedConversations,
    selectedConversation: formattedConversations[selectedConversationIndex],
    sendMessage,
    selectConversationIndex: setSelectedConversationIndex,
    createConversation,
  };

  return <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>;
};

function arrayEquality(a: string[], b: string[]) {
  if (a.length !== b.length) return false;

  a.sort();
  b.sort();

  return a.every((element, index) => {
    return element === b[index];
  });
}
