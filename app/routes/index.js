'use strict';
const passport = require('passport');
const h = require('../helpers');
const config = require('../config');
const mongoClient = require('../db');
const ObjectId = require('mongodb').ObjectId;

module.exports = () => {
  let routes = {
    'get': {
      '/': (req, res, next) => {
        res.render('login');
      },
      '/rooms': [h.isUserAuthenticated, (req, res, next) => {
        res.render('rooms', {
          user: req.user || { profilePic: '/img/default_profilePic.png', fullName: req.session.fullName },
          host: config.host
        });
      }],
      '/chatroom/:id': [h.isUserAuthenticated, (req, res, next) => {
        console.log('chatroom/id:', req.user, req.params.id);
        let getRoom = h.findRoomById(req.app.locals.chatrooms, req.params.id);
        if (getRoom === undefined) {
          next();
        }
        else {
          res.render('chatroom', {
            user: req.user || { profilePic: '/img/default_profilePic.png', fullName: req.session.fullName, userId: req.session.userId },
            host: config.host,
            room: getRoom.room,
            roomId: getRoom.roomId
          });
        }
      }],
      '/logout': (req, res, next) => {
        req.logout();
        res.redirect('/');
      },
      '/auth/linkedin': passport.authenticate('linkedin'),
      '/auth/linkedin/callback': passport.authenticate('linkedin', {
        successRedirect: '/rooms',
        failureRedirect: '/',
        // session: false
      }),
      '/setSession': (req, res, next) => {
        req.session.color = 'red';
        req.session.name = 'redis';
        res.send('Session set');
      },
      '/getSession': (req, res, next) => {
        res.send('Session color:' + req.session.color + req.session.name);
      }
    },
    'post': {
      '/createUser': (req, res, next) => {
        const fname = req.body.fname;
        const uname = req.body.uname;
        const psw = req.body.psw;
        if (fname && uname && psw) {
          mongoClient.then((client) => {
            const dataBase = client.db('chatapp-db');
            let collection = dataBase.collection("user");
            collection.insertOne({ fullName: fname, userLoginId: uname, password: psw })
              .then((err, result) => {
                if (!err) {
                  console.log('user inserted');
                }
              })
              .catch(function (err) {
                console.log('user not found !', err);
                client.close();
              });
          });
        }
        res.redirect('/');
      },

      '/userLogin': (req, res, next) => {
        const uname = req.body.uname;
        const psw = req.body.psw;
        if (uname && psw) {
          mongoClient.then((client) => {
            const dataBase = client.db('chatapp-db');
            let collection = dataBase.collection("user");
            collection.findOne({ userLoginId: uname, password: psw })
              .then((user) => {
                if (user) {
                  // set req.session , which will be set in cookie and sent back to client
                  req.session.userId = user._id;
                  req.session.fullName = user.fullName;
                  res.redirect('/rooms');
                }
              })
              .catch((err) => {
                console.log('user not found !', err);
                client.close();
                res.redirect('/');
              });
          });
        }
      }
    },
    'NA': (req, res, next) => {
      res.status(404).sendFile(process.cwd() + '/views/404.htm');
    }
  };
  return h.route(routes);
}