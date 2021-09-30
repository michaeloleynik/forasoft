const express = require('express');

const app = express();
const { createServer } = require('http');
const { Server } = require('socket.io');


const server = createServer(app);
const io = new Server(server);


app.use(express.json());

const rooms = new Map();

app.get('/rooms/:id', (req, res) => {
  const { id: roomId } = req.params;
  const obj = rooms.has(roomId)
    ? {
        peers: [...rooms.get(roomId).get('users').keys()],
        users: [...rooms.get(roomId).get('users').values()],
        messages: [...rooms.get(roomId).get('messages').values()],
      }
    : { peers: [], users: [], messages: [] };

    console.log('obj',obj);
  res.json(obj);
});

app.post('/rooms', (req, res) => {
  const { roomId, userName } = req.body;
  if (!rooms.has(roomId)) {
    rooms.set(
      roomId,
      new Map([
        ['users', new Map()],
        ['messages', []],
      ]),
    );
  }
  res.status(200).json({ userName, roomId, message: "Success!"});
});

io.on('connection', (socket) => {
  socket.emit('USER:CONNECT', socket.id);
  socket.on('ROOM:JOIN', ({ roomId, userName }) => {
    socket.join(roomId);
    rooms.get(roomId).get('users').set(socket.id, userName);
    const peers = [...rooms.get(roomId).get('users').keys()];
    const users = [...rooms.get(roomId).get('users').values()];
    socket.to(roomId).emit('ROOM:SET_USERS', { peers, users });
  });

  socket.on('ROOM:NEW_MESSAGE', ({ roomId, userName, text, createdTime }) => {
    const obj = {
      userName,
      text,
      createdTime,
    };
  
    rooms.get(roomId).get('messages').push(obj);
    socket.to(roomId).emit('ROOM:NEW_MESSAGE', obj);
  });

  socket.on('LOGOUT', () => {
    rooms.forEach((value, roomId) => {
      if (value.get('users').delete(socket.id)) {
        const peers = [...rooms.get(roomId).get('users').keys()];
        const users = [...value.get('users').values()];
        value.get('users').delete(socket.id);        
        socket.to(roomId).emit('ROOM:SET_USERS', { peers, users });
      }
    });
  });

  socket.on("ROOM:SEND_SIGNAL", ({userToSignal, signal, callerID}) => {
    socket.to(userToSignal).emit('USER:STARTED_VIDEO', { signal, callerID });
  });

  socket.on('disconnect', () => {
    rooms.forEach((value, roomId) => {
      if (value.get('users').delete(socket.id)) {
        const peers = [...rooms.get(roomId).get('users').keys()];
        const users = [...value.get('users').values()];
        value.get('users').delete(socket.id);        
        socket.to(roomId).emit('ROOM:SET_USERS', { peers, users });
      }
    });
  });

  console.log(`user connected ${socket.id}`);
});

server.listen(5000, (err) => {
  if (err) {
    throw Error(err);
  }
  console.log('Server is working!');
});
