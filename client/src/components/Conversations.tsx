import * as React from 'react';
import { ListGroup } from 'react-bootstrap';
import { useConversations } from '../contexts/ConversationsProvider';

interface Conversation {
  selected: any;
  recipients: any[];
}

const Conversations: React.FC = () => {
  const { conversations, selectConversationIndex } = useConversations();

  return (
    <ListGroup variant="flush">
      {conversations.map((conversation: Conversation, index: number) => (
        <ListGroup.Item
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          action
          onClick={() => selectConversationIndex(index)}
          active={conversation.selected}
        >
          {conversation.recipients.map((r) => r.name).join(', ')}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default Conversations;
