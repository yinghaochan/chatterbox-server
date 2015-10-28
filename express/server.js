var express = require('express');
var app = express();
var _ = require('underscore');
var path = require('path');
var monk = require('monk');
var db = monk('mongodb://chatterAdmin:chadmin@ds045664.mongolab.com:45664/chatterbox');


app.use(require('morgan')('dev'));
app.use(require('body-parser').json());

//routes
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});
app.use(express.static(path.join(__dirname , '../client')));
app.use(function (req, res, next) {
  req.db = db;
  req.msgs = db.get('messages');
  next();
});


app.get('/classes/:room', function (req, res) {
  req.msgs.find({},{},function (e, docs) {
    // console.log(docs);
  res.send({'results': docs});
  });
});

app.post('/classes/:room', function (req, res) {
  var message = {username: req.body.username, text: req.body.text, createdAt: new Date()};
  // console.log(message);
  req.msgs.insert(message);
  res.send("success!");
});

app.listen(3000);
