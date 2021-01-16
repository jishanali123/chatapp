'use strict';
const router = require('express').Router();
const crypto = require('crypto');

// Iterate through the routes object and mount the routes
let _registerRoutes = (routes, method) => {
  for (let key in routes) {
    if (typeof routes[key] === 'object' && routes[key] !== null && !(routes[key] instanceof Array)) {
      _registerRoutes(routes[key], key);
    } else {
      // Register the routes
      if (method === 'get') {
        router.get(key, routes[key]);
      } else if (method === 'post') {
        router.post(key, routes[key]);
      } else {
        router.use(routes[key]);
      }
    }
  }

};

let route = routes => {
  _registerRoutes(routes);
  return router;
};

// check to see if user is still authenticated by use passport
let isUserAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() || req.session.userId) {
    next();
  } else {
    res.redirect('/');
  }
};

// find a chatroom by a given name
let findRoomByName = (allrooms, room) => {
  let findRoom = allrooms.findIndex((element, index, array) => {
    if (element.room === room) {
      return true;
    } else {
      return false;
    }
  });
  return findRoom > -1 ? true : false;
};

// function that generates a unique roomId
let randomHex = () => {
  return crypto.randomBytes(24).toString('hex');
}

//find room by roomId
let findRoomById = (allrooms, roomId) => {
  return allrooms.find((room) => {
    return room.roomId === roomId;
  });
}

// add a user to a chatroom
let addUserToRoom = (allrooms, data, socket) => {
  // get the room object
  let getRoom = findRoomById(allrooms, data.roomId);
  if (getRoom !== undefined) {
    // get the active user's Id (ObjectId as used in session)
    // let userId = socket.request.session.passport.user;
    let userId = data.userId;
    //check to see if this user already exists in the chatroom
    let checkUser = getRoom.users.findIndex((user) => {
      if (user.userId === userId) {
        return true;
      } else {
        return false
      }
    });
    // if the user already present in the room, remove him first
    if (checkUser > -1) {
      getRoom.users.splice(checkUser, 1);
    }
    // push the user to room's user array
    getRoom.users.push({
      socketId: socket.id,
      userId,
      user: data.user,
      userPic: data.userPic
    });
    // join the room channel
    socket.join(data.roomId);
    // return the updated room object
    return getRoom;
  }
};

// remove user from a room
let removeUserFromRoom = (allrooms, socket) => {
  for (let room of allrooms) {
    let findUserIndex = room.users.findIndex((user) => {
      return user.socketId === socket.id ? true : false;
    });
    if (findUserIndex > -1) {
      // leave a particular room
      socket.leave(room.roomId);
      room.users.splice(findUserIndex, 1);
      return room;
    }
  }
};

module.exports = {
  route,
  isUserAuthenticated,
  findRoomByName,
  randomHex,
  findRoomById,
  addUserToRoom,
  removeUserFromRoom
}