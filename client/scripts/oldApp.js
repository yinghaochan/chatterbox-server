/*

1 - store all messages that are in the chat
2 - limit the number of messages that are pulled from the api with each call
3 - pull the results from the api in the reverse create data order
4 - adjust the render function so that only new messages that are received are rendered
5 - adjust the render function for the rooms so that only the new rooms are added to the list of rooms
6 - modularize code so that it makes it clearer what we are doing and we can possibl


*/




var app = {
  messageStorage : [],
  rooms: [],
  currentRoom: undefined,
  friends: {},

  server: "https://api.parse.com/1/classes/chatterbox",
  
  init: function() {
    app.fetch();
  },


  refresh: function() {
    app.clearMessages();
    app.fetch();
    app.addAllMessages();
    app.addAllRooms();
  },  
  
  /*
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  ~~~~~~~~~API FUNCTIONS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  */

  send: function(message) {
    $.ajax({
      url: this.server,
      type: "POST",
      data: JSON.stringify(message),
      success: function() {
        console.log("It is working");
      }
    });
  },

  fetch: function() {
    $.ajax({
      url: app.server,
      type: "GET",
      headers: {
        //app and api key headers are automatically inserted for you by the config file
        "Content-Type" : "application/json"
      },
      data: {
        order: -createdAt,
        limit: 100
      },
      // data: all data from server
      success: function(data) {
        // update the current message storage
        
        app.messageStorage = [];
        app.rooms = {};
        _.each(data.results,function(message) {

          if(!$.inArray(message, app.messageStorage)) {

            message.rendered = false;
            app.messageStorage.push(message);

          }
          if(!$.inArray(message.roomname, app.rooms)) {

            roomObj = {
              roomname: message.roomname,
              rendered: false
            };

            app.rooms.push(roomObj);

          }

        });

      }
    });
  },

  /*
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  ~~~~~~~~~MESSAGES~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  */

  clearMessages: function() {
    $("#chats").empty();
    $("#roomSelect").empty();
  },

  addMessage: function(msg) {
    var messageBox = $('<div class="messageBox row"></div>');
    var username = app.friends[msg.username] === undefined ? app.escapeCharacters(msg.username) : '<b>'+app.escapeCharacters(msg.username)+'</b>';
    messageBox.append('<div class="username col s4"><a class="usernameLink">'+username+'</a></div>')
              .append('<div class="text col s8"><span>'+app.escapeCharacters(msg.text)+'</span></div>');
    $("#chats").append(messageBox);
  },

  addAllMessages: function() {
    //console.log(app.messageStorage);
    _.each(app.messageStorage, function(msg) {
      if(msg.rendered) {
        continue;
      } else if(!app.currentRoom) {
        app.addMessage(msg);
      } else if(msg.roomname === app.currentRoom) {
        app.addMessage(msg);
      }
      // console.log(msg.roomname+' : '+app.currentRoom);
    });
  },

  generateMessage: function(username, text, roomname) {
    return {
      username: username,
      text: text,
      roomname: roomname
    };
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var msg = $("#message").val();
    var name = window.location.search.replace('?username=','');
    var room = app.currentRoom || 'lobby';
    var newMsg = app.generateMessage(name, msg, room);
    app.send(newMsg);
  },

  /*
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  ~~~~~~~~~ROOMS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  */

  addAllRooms: function() {
    _.each(app.rooms, function(val, room) {
      room = room === "undefined" ? room : JSON.parse(room);
      var domRoom = '<a id="happyButton" class="collection-item grey darken-1';
      if(app.currentRoom === app.escapeCharacters(room)) {domRoom += ' active';}
      domRoom += '">'+app.escapeCharacters(room)+'</a>';
      $("#roomSelect").append(domRoom);
    });
  },

  addRoom: function(room) {

  },

  handleNewRoom: function(e) {
    e.preventDefault();
    var name = window.location.search.replace('?username=','');
    var msg = name + ' created a new room called '+$("#newRoom").val()+'...enjoy';
    var newMsg = app.generateMessage(name, msg, $("#newRoom").val());
    app.send(newMsg);
  },


  addFriend: function(friend) {
    app.friends[friend] = 1;
    app.refresh();
  },

  escapeCharacters : function(text) {
    
    if(text !== undefined && text !== null) {
      text = text.replace('\<script\>','');
      text = text.replace('\<\/script\>','');
      text = text.replace('&','\&');
      text = text.replace('<','');
      text = text.replace('>','\>');
      text = text.replace('"','\"');
      text = text.replace("'","\'");
      text = text.replace('`','\`');
      text = text.replace('!','\!');
      text = text.replace('@','\@');
      text = text.replace('$','\$');
      text = text.replace('%','\%');
      text = text.replace('(','\(');
      text = text.replace(')','\)');
      text = text.replace('=','\=');
      text = text.replace('+','\+');
      text = text.replace('{','\{');
      text = text.replace('}','\}');
      text = text.replace('[','\[');
      text = text.replace(']','\]');  
    }
    
    return text;
  }
};

$(document).ready(function() {
  app.init();

  // function getRoomname() {
  //   var roomname = $(this).
  // }

  $("#submit").on("submit", app.handleSubmit);



  setInterval(function() {
    app.refresh();
  }, 1000);

  $("body").on("click", "#happyButton", function(e){
    app.currentRoom = $(this).text();
    app.refresh();
  });

  $("#submitNewRoom").on("submit", app.handleNewRoom);

  $("body").on("click", ".usernameLink", function(e){
    app.addFriend($(this).text());
  });

  

  // $("#dropdown-menu").on("click", getRoomname);
});
