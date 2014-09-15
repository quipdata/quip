function Chat( _fbChatRef, _fbToken, _userName ){
	this.userName = _userName;
	this.fbChatRef = _fbChatRef;
	this.fbChat = new Firebase( this.fbChatRef );
	this.firstChat = true;
	
	this.fbChat.auth(_fbToken, function(error, result) {
		if(error) {
			openBlockingAlert( 'Could not start the application. Please try again latter.' );
			throwError( 'index', 'Start Up', 'Firebase chat failed to start', true );
		}
	});
	
	this.fbChat.once('value', function(data) {
		master.chat.startChat();
	}, function(err){
		openBlockingAlert( 'Could not start the application. Please try again latter.' );
		throwError( 'index', 'Start Up', 'Firebase chat failed to start', true );
	});
}

Chat.prototype.startChat = function(){
	this.fbChat.on('child_added', function(snapshot) {
		var message = snapshot.val();
		master.chat.displayMessage(message.name, message.text);
	});
	
	$('#txt_message').keypress(function (e) {
		if (e.which == 13) {
			master.chat.send();
			$('#txt_message').val('');
		}
	});
}

Chat.prototype.send = function(){
	var text = $('#txt_message').val();
	this.fbChat.push({name: this.userName, text: text});
	$('#txt_message').val('');
}

Chat.prototype.displayMessage = function(name, text) {
	var msg = name + ": " + text;
	
	if( this.firstChat ){
		this.firstChat = false;	
	} else {
		msg = "<br />" + msg;
	}
	$('#chat_window').append( msg );	
	$('#chat_window')[0].scrollTop = $('#chat_window')[0].scrollHeight;
};

Chat.prototype.toggle = function(){
	if( $('#wandering_chat').css( 'display' ) == 'none' ){
		this.open();
	} else {
		this.close();
	}
}

Chat.prototype.open = function(){
	$('#ribbon_chat').removeClass('icon')
		.addClass('icon_selected');
		
	$('#wandering_chat').show();
	$('#chat_window')[0].scrollTop = $('#chat_window')[0].scrollHeight;
}

Chat.prototype.close = function(){
	$('#ribbon_chat').removeClass('icon_selected')
		.addClass('icon');
		
	$('#wandering_chat').hide();
}
