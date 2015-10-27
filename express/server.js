var express = require('express');
var app = express();
var _ = require('underscore');
var path = require('path');

var _storage = [];
var insertMsg = function(message) {
  message.createdAt = new Date();
  message.objectId = _storage.length;
  _storage.push(message);
};
var getMsg = function(room) {
  if(!room){return JSON.stringify({results: _storage});}
  var msgArr =  _.filter(_storage, function(value, key, list){
    return value.roomname === room;
  });
  return JSON.stringify({results: msgArr});
};

insertMsg({
      username: 'nick',
      text: 'hello everyone',
      roomname: 'homeroom'
    });

app.use(require('morgan')('dev'));
app.use(require('body-parser').json());

//routes
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../client/bbIndex.html'));
});
app.use(express.static('../client'));

app.get('/classes/:room', function (req, res) {
  var room = req.params.room;
  if(room === 'messages') room = '';
  res.send(getMsg(room));
});

app.post('/classes/:room', function (req, res) {
  insertMsg(req.body);
});

app.listen(3000);
