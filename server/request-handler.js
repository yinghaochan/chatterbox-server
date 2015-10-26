/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var _ = require('underscore');


var _storage = [];

var insertNewMessage = function(message) {
  message.createdAt = new Date();
  message.objectId = JSON.stringify(message);
  _storage.push(message);
};

var getMessages = function(room) {
  if(!room){return _storage;}
  return _.filter(_storage, function(value, key, list){
    return value.roomname === room;
  });
};

// insertNewMessage({
//       username: 'nick',
//       text: 'hello everyone',
//       roomname: 'homeroom'
//     });

console.log(_storage);

var requestHandler = function(request, response) {

  console.log(request.method);

  var headers = defaultCorsHeaders;

  headers['Content-Type'] = "text/plain";

  var url = request.url.split("/");


  var statusCode = 404;
  var outgoingBody = "404 - Not Found";
  console.log(request.url);
  switch(url[1]) {
    case 'classes':
      if(url[2] === 'messages'){
        if(request.method === 'GET') {
          console.log('getting messages');
          statusCode = 200;
          outgoingBody = JSON.stringify({results:getMessages()});
        } else if(request.method === 'POST') {
          console.log('making new message');
          statusCode = 201;
          request.on('data', function(chunk) {
            insertNewMessage(JSON.parse(chunk.toString()));
          });

          outgoingBody = 'inserted new message';
        }
        break;
      }else{
        if(request.method === 'GET') {
          statusCode = 200;
          outgoingBody = JSON.stringify({results:getMessages(url[2])});
        } else if(request.method === 'POST') {
          statusCode = 201;
          request.on('data', function (chunk) {
            // console.log(chunk.toString);
            chunk = JSON.parse(chunk.toString());
            chunk.roomname = url[2];
            insertNewMessage(chunk);
          });
        }
      }
      break;
    default:
      break;
  }




  response.writeHead(statusCode, headers);
  response.end(outgoingBody);

};


// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept, X-Parse-Application-Id, X-Parse-REST-API-Key",
  "access-control-max-age": 10 // Seconds.
};



exports.requestHandler = requestHandler;






















  // if(request.method === 'GET') {
  //   if(request.url === '/classes/messages/'){
  //     outgoingBody = JSON.stringify({results:getMessages()});
  //   }
  // } else if(request.method === 'POST') {
  //   if(request.url === '/classes/messages/'){
  //     request.on('data', function(chunk) {
  //       console.log("Received body data:");
  //       insertNewMessage(JSON.parse(chunk.toString()));
  //     });
  //     // insertNewMessage(request.data);
  //     outgoingBody = 'inserted new message';
  //   }
  // }
