const express = require('express');

const app = express();
const { createServer } = require('http');
const { Server } = require('socket.io');

app.use(express.json());

const server = createServer(app);
const io = new Server(server);

const rooms = new Map();

app.get('/rooms/:id', (req, res) => {
  const { id: roomId } = req.params;
  const obj = rooms.has(roomId)
    ? {
        users: [...rooms.get(roomId).get('users').values()],
        messages: [...rooms.get(roomId).get('messages').values()],
      }
    : { users: [], messages: [] };
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
  socket.on('ROOM:JOIN', ({ roomId, userName }) => {
    socket.join(roomId);
    console.log(rooms);
    rooms.get(roomId).get('users').set(socket.id, userName);
    const users = [...rooms.get(roomId).get('users').values()];
    socket.to(roomId).emit('ROOM:SET_USERS', users);
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
        const users = [...value.get('users').values()];
        value.get('users').delete(socket.id);        
        socket.to(roomId).emit('ROOM:SET_USERS', users);
      }
    });
  });

  socket.on('disconnect', () => {
    rooms.forEach((value, roomId) => {
      if (value.get('users').delete(socket.id)) {
        const users = [...value.get('users').values()];
        socket.to(roomId).emit('ROOM:SET_USERS', users);
      }
    });
  });

  console.log(`user connectd ${socket.id}`);
});

server.listen(5005, (err) => {
  if (err) {
    throw Error(err);
  }
  console.log('Server is working!');
});
