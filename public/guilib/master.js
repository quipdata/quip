function Master( _fbModelRef, _fbToken, _userID, _userName, _unitTest ){
	this.fbModelRef = _fbModelRef;
	this.fbToken = _fbToken;
	this.userID = _userID
	this.userName = _userName;
	this.model = {};
	this.errors = [];
	
	this.fileUUID = getPointerUUID( this.fbModelRef );
	this.fbChatRef = this.fbModelRef.replace( '/files/', '/chat/' );
	
	this.transaction = new Transaction( this.fbModelRef, this.fbToken );
	
	this.canvas;

	//Condition UI
	//If unit test, there will be no UI, so don't run the following.
	if( typeof _unitTest == 'boolean' && _unitTest ) return
		
	this.chat = new Chat( this.fbChatRef, this.fbToken, this.userName );
	
	this.ormObj = new ORMOBJ();
	
	//Condition UI
	$( document ).ready(function(){
		//Set up layout
		selectRibbon( 'ribbon_view' );
		$( "#wandering_font_style" ).draggable({ handle : "#div_font_style_bar" });
		$( "#wandering_chat" ).draggable({ handle : "#div_chat_bar" })
			.resizable({ 
				alsoResize : "#wandering_chat_main #wandering_chat_main_two"
				, minHeight: 260
			});
		$( "#wandering_mass_add" ).draggable({ handle : "#wander_mass_add_bar" });
			
		if( this.model == null || this.model == undefined || this.model.loaded == undefined || typeof this.model.loaded != 'boolean' || !this.model.loaded ){			
			openBlockingAlert( 'Loading please wait...' );	
		}
		
		master.canvas = new Canvas();
	});
}
