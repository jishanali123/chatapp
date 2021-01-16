'use restrict'

const h = require('../helpers');

module.exports = (io, app) => {
  let allrooms = app.locals.chatrooms;
  /*
  allrooms.push({
    room: 'Good Food',
    roomId: '0001',
    users: [],
  },
    {
      room: 'Cloud Computing',
      roomId: '0002',
      users: [],
    });
    */
  // socket name space 'roomsList'
  io.of('/roomsList').on('connection', socket => {
    console.log('Connected to client name space roomsList!');
    // listen to an event getChatrooms and after recieving do some action in callback
    socket.on('getChatrooms', () => {
      // emit an event 'chatRoomsList' with the required data
      socket.emit('chatRoomsList', JSON.stringify(allrooms));
    });

    // listen to 'createNewRoom' event from client
    socket.on('createNewRoom', (newRoomInput) => {
      // check to see if the room with same title exist or not in rooms list
      // if not , then create one and broadcast to everyone
      if (!h.findRoomByName(allrooms, newRoomInput)) {
        // create a new room and broadcast to all
        allrooms.push({
          room: newRoomInput,
          roomId: h.randomHex(),
          users: []
        });
        // emit an updated list of rooms to creator
        socket.emit('chatRoomsList', JSON.stringify(allrooms));
        // emit an updated list of rooms to everyone connected to the rooms page
        socket.broadcast.emit('chatRoomsList', JSON.stringify(allrooms));

      }
    });
  });

  // socket name space 'chatter'
  io.of('/chatter').on('connection', socket => {
    console.log('Connected to client with name space chatter!');
    // 'join' a chatroom event handler
    socket.on('join', (data) => {
      let room = h.addUserToRoom(allrooms, data, socket);
      if (room) {
        // send/broadcast an even with updated user list to every user(socket i.e socketID) connected to particular roomId except the user just connected/joined
        socket.to(room.roomId).emit('updatedUsersList', JSON.stringify(room.users));
        // socket.broadcast.emit('updatedUserList', JSON.stringify(room.users));
        // send an even with updated user list to the user just connected/joined
        socket.emit('updatedUsersList', JSON.stringify(room.users));
      }
    });
    // when a socket exits that is when a user navigated apart from chatroom route or logout
    socket.on('disconnect', () => {
      // find the room to which user connected to and purge the user and update the user list of room
      let room = h.removeUserFromRoom(allrooms, socket);
      // // send/broadcast an event with updated user list to every user(socket i.e socketID) connected to particular roomId except the user just left from room
      if (room) {
        socket.to(room.roomId).emit('updatedUsersList', JSON.stringify(room.users));
      }
    });

    // when new message arrives
    socket.on('newMessage', (data) => {
      socket.to(data.roomId).emit('inMessage', JSON.stringify(data));
    })
  });
};