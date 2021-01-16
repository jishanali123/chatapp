'use strict';

require('./auth')();

// create an io server instance
let ioServer = app => {
  const server = require('http').Server(app);
  app.locals.chatrooms = [];
  const io = require('socket.io')(server);
  io.use((socket, next) => {
    require('./session')(socket.request, {}, next);
  })
  require('./socket')(io, app);
  return server;
}

module.exports = {
  router: require('./routes')(),
  session: require('./session'),
  ioServer
}