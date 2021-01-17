const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const config = require('../config');
const mongoClient = require('../db');
const ObjectId = require('mongodb').ObjectID;

module.exports = () => {

  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    mongoClient.then((client) => {
      const dataBase = client.db('chatapp-db');
      let collection = dataBase.collection("user");
      collection.findOne({ _id: ObjectId(id) })
        .then((user) => {
          done(null, user);
        })
        .catch(function (err) {
          console.log('user not found !', err);
          client.close();
        });
    });
  });
  let authProcessor = (token, tokenSecret, profile, done) => {
    // find a user in local db using profile.db
    // if the user is found, return the user data using done()
    // if the user is not found then create one in local db
    mongoClient.then((client) => {
      const dataBase = client.db('chatapp-db');
      let collection = dataBase.collection("user");
      collection.findOne({ profileId: profile.id })
        .then((result) => {
          if (result.length !== 0) {
            done(null, result);
          } else {
            // create a new user and return
            collection.insertOne({
              profileId: profile.id,
              fullName: profile.displayName,
              profilePic: profile.photos[0].value || ''
            })
              .then((result) => {
                done(null, {
                  profileId: profile.id,
                  fullName: profile.displayName,
                  profilePic: profile.photos[0].value || ''
                });
              })
              .catch((err) => {
                console.log('error:', err);
              });
          }
        });
    }).catch(function (err) {
      console.log('DB Problem !', err);
      client.close();
    });
  }
  passport.use(new LinkedInStrategy(config.linkedin, authProcessor));
};