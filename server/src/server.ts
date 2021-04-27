import express, { Request, Response } from 'express';
import ioserver, { Socket } from 'socket.io';

const PORT = 5000;

const app = express();
const server = require('http').Server(app);

const io = ioserver(server);

interface SendMsgObject {
  recipients: string[];
  text: string;
}

app.get('/', (req: Request, res: Response) => {
  res.json({ data: 'hello world' });
});

io.on('connection', (socket: Socket) => {
  console.log('Connected');
  const { id } = socket.handshake.query;
  socket.join(id);

  socket.on('send-message', ({ recipients, text }: SendMsgObject) => {
    recipients.forEach((recipient: string) => {
      const newRecipients = recipients.filter((r) => r !== recipient);
      newRecipients.push(id);
      socket.broadcast.to(recipient).emit('receive-message', {
        recipients: newRecipients,
        sender: id,
        text,
      });
    });
  });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));
