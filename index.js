const express = require('express');
const path = require('path');
const passport = require('passport');
const chatApp = require('./app');

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(chatApp.session);
app.use(passport.initialize());
app.use(passport.session());

app.use('/', chatApp.router);

chatApp.ioServer(app).listen(app.get('port'), () => {
  console.log(`Listening on port ${app.get('port')}`);
});