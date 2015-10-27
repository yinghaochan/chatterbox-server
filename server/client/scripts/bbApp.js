

var Message = Backbone.Model.extend({

  initialize: function() {

  },

  defaults: {
      text: '',
      username: '',
      roomname: ''
  }

});

var Messages = Backbone.Collection.extend({
  
  //need to set the model that we will be using for each of the items that are fetched from the API call
  model: Message,

  //url to which we want to make the API call
  url: 'http://127.0.0.1:3000/classes/messages',
  // url: 'https://api.parse.com/1/classes/chatterbox',
  

  //if we want to add in data parameters to filter a API call, we need to wrap the given fetch method with another method
  getMessages: function() {
    // this.fetch({
    //   data:{
    //     order: '-createdAt'
    //   }
    // });
    this.fetch();
  },

  //this is a Backbone method that accepts the response from the fetch call
  //we need to use this to return the array that we want the collection to hold
    //this should be filled with only objects that have the same format as out model
  parse: function(res) {
    //we need to customize this for each api call for other implementations
      //for this one, it happens to be results
    // console.log(res.results);
    return res.results.reverse();
  }

});

var MessageView = Backbone.View.extend({

  //the template variable on a Backbone model is used to store the template for the dom element that we will be createing
  // <%- attribute %> denotes a placeholder that will automatically be filled by back bone by calling the template and passing it a model
    //the model that is passed to template must contain the variable in it, or else it will just be null
  template: _.template('<div><%- createdAt %> : <%- username %> : <%- text %></div>'),

  render: function() {
    //generating an instance of the template with it's values filled in with the model passed to the view
    var templateInstance = this.template(this.model.attributes);
    //set the el property of the view instance to the completed template
    this.$el.html(templateInstance);
    //pass the completed dom element as the result of the render
    return this.$el;
  }

});

var MessagesView = Backbone.View.extend({

  //REQUIRED INPUTS:
    //$el : this is the dom element in our page that we will be acting on
    //collection: this is the collection of models that we will be passing into the view

  initialize: function() {
    //during initiallization we not only set variables, but for views we will need to set event listeners
    //in this case we are setting the on property for the collection that we instanciated the Message view with
      //the 'sync' event type will trigger when there is a new change to the collection
      //in the case that we encounter a change in the collection, we want to rerender the messages
      //we also need to make sure that we are passing in the context to the render function (why is this?)
    this.collection.on('sync',this.render, this);
    this.msgsInDom = {};
    this.currentRoom = '';
  },

  events: {
    'click .roomLink': 'changeRoom'
  },

  changeRoom: function(e) {
    console.log(e);
  },

  render: function() {
    //we need to loop through each of the items in the collection, and render them on the screen
    this.collection.forEach(this.renderMessage,this);
  },

  renderMessage: function(message) {
    if(!this.msgsInDom[message.get('objectId')]) {
      //we can use the MessageView Backbone View that we created for each of the items in the collection
      //to do this we need to create a new instance of the MessageView for each item
      var messageView = new MessageView({model: message});
      //we now have an instance of a message view for a single message model
      //we will call the render function from the messageView which will return the html for the message
      var $msgHtml = messageView.render();
      //prepend the msg html that we just generated to the $el property on the MessagesView instance
        //$el is the dom element for the instnace that we created.
        //it needs to be instanciated on the first call in order to be used like this
      this.$el.append($msgHtml);
      this.$el.scrollTop(this.$el[0].scrollHeight);

      this.msgsInDom[message.get('objectId')] = true;

    }
  }

});

var FormView = Backbone.View.extend({

  initialize: function() {
    this.collection.on('sync',this.render, this);
  },

  events: {
    'submit #send': 'handleSubmit'
  },

  handleSubmit: function(e) {
    e.preventDefault();

    var $text = this.$('#newMessage');

    var msg = $text.val();
    var name = window.location.search.replace('?username=','');
    var room = 'lobby';

    var newMsg = {
      text: msg,
      username: name,
      roomname: room
    };

    console.log(newMsg);

    var message = new Message(newMsg);

    $text.val('');
    
    this.collection.create(message);
  }

});

var RoomView = Backbone.View.extend({

  template: _.template('<li><a href="#!" class="roomLink"><%- roomname %></a></li>'),

  render: function() {
    
    var templateInstance = this.template(this.model.attributes);
    
    this.$el.html(templateInstance);
    
    return this.$el;
  }

});

var RoomsView = Backbone.View.extend({

  initialize: function() {
    this.collection.on('sync',this.render, this);
    this.roomsInDom = {};
  },

  render: function() {
    this.collection.forEach(this.renderRoom,this);
  },

  renderRoom: function(message) {
    // debugger;

    var room = message.get('roomname') || 'lobby';

    if(!this.roomsInDom[room]) {
      
      var roomView = new RoomView({model: message});
      
      var $roomHtml = roomView.render();
      
      this.$el.append($roomHtml);

      this.roomsInDom[room] = true;

    }
  }

});



var messages = new Messages();

var messagesView = new MessagesView({el: $('#messages'), collection: messages});

messages.getMessages();

var formView = new FormView({el: $('#newMessageInput'), collection: messages});

var roomsView = new RoomsView({el: $('#roomDropList'), collection: messages});

setInterval(messages.getMessages.bind(messages),1000);















