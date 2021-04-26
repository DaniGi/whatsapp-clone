import * as React from 'react';
import * as io from 'socket.io-client';

interface Props {
  id: string;
}

type SocketContextInterface = SocketIOClient.Socket | null;

const { useContext, useEffect, useState } = React;

const SocketContext = React.createContext<SocketContextInterface>(null);

export function useSocket() {
  return useContext(SocketContext);
}

export const SocketProvider: React.FC<Props> = ({ id, children }) => {
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);

  useEffect(() => {
    const newSocket = io.connect('http://localhost:5000', { query: { id } });
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [id]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
