function throwError( _source, _function, _message, _throw ){
	errors[errors.length] = [ _source, _function, _message ];
	if( _throw == undefined || _throw )
		throw new Error(_message);
}

function criticalError(){
	//Lock UI
	
	fbModel.once('value', function(data) {
		model = data.val();
		//Unlock UI
	});
	
	alert('There has been a critical error. Please wait while we restore the program!');
}
