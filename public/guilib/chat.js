$('#txt_message').keypress(function (e) {
	if (e.keyCode == 13) {
		sendChat()
	}
});

function sendChat(){
	var text = $('#txt_message').val();
	fbChat.push({name: userID, text: text});
	$('#txt_message').val('');
}

function startChat(){
	fbChat.on('child_added', function(snapshot) {
		var message = snapshot.val();
		displayChatMessage(message.name, message.text);
	});
}

function displayChatMessage(name, text) {
	$('#chat_window').prepend( "<p>" + name + ": " + text + "</p>" );	
	//$('<div/>').text(text).prepend($('<em/>').text(name+': ')).appendTo($('#chat_window'));
	$('#chat_window')[0].scrollTop = $('#chat_window')[0].scrollHeight;
};