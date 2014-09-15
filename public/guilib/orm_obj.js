function ORMOBJ(){
	this.active = false;
	
	//objectID and value.id must both be changed to the SAME value
	this.entityTemplate = {	
		"objectID" : "#/Model/Model/ModelObjects/UUID",
		"commandType" : "insert",
		"value" : {
		    "id": "#/Model/Model/ModelObjects/UUID",
		    "name": "",
		    "type": "Entity",
		    "notes": "",
		    "ModelRelationshipConnectors": { "empty":"" }
		}
	}
}

ORMOBJ.prototype.addEntity = function( _mouseX, _mouseY ){
	var newModelID = uuid.v4();

	var aAction = cloneJSON( this.entityTemplate );
	aAction.objectID = "#/Model/Model/ModelObjects/" + newModelID;
	aAction.value.id = "#/Model/Model/ModelObjects/" + newModelID;
	
	var actions = [ aAction ];
	
	try{
		var trans = master.transaction.createTransaction( "Model", actions );
	
		var visualActions = master.canvas.ormObj.addEntity( newModelID, _mouseX, _mouseY );
		
		var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
		
		master.transaction.processTransactions( trans );
	}catch(err){
		throwError( 'orm_obj.js', 'addEntity', err.message, false );
		return;
	}
}

ORMOBJ.prototype.editName = function( _id, _value ){
	if( cleanObjPointer( _id ).substring( 0, 24 ) !== 'Model/Model/ModelObjects' ){
		throwError( 'orm_obj.js', 'editName', 'Passed ID was not to an object in Model.Model.ModelObjects' );
	}
	
	var modelGroup = getObjPointer( master.model, _id );
	
	if( modelGroup == undefined ){
		throwError( 'orm_obj.js', 'editName', 'Passed ID was not found in the model' );
	}
	
	modelGroup.name = _value;
	
	var newAction = cloneJSON( this.entityTemplate );
	newAction.type = 'update';
	newAction.objectID = _id;
	newAction.value = modelGroup; 
	
	var trans = master.transaction.createTransaction( "Model", newAction );
	
	var visualGroup = master.canvas.ormObj.findGroupByModelID( _id );
	
	if( visualGroup != undefined ){
		var visualActions = master.canvas.ormObj.editName( visualGroup.id, _value );
		
		var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
	}
	
	master.transaction.processTransactions( trans );
}

ORMOBJ.prototype.toggle = function( _icon ){
	if( typeof this.active == 'boolean' && this.active ){
		this.close( _icon );
	} else {
		this.open( _icon );
	}
}

ORMOBJ.prototype.open = function( _icon ){
	var id = ""
	if( _icon = 'entity' ){
		id = "icons_entity";
	}
	
	$('#' + id).removeClass('icon')
		.addClass('icon_selected');
		
	$('#ui').addClass('entity_selected');
	
	this.active = true;
	
	master.canvas.ormObj.toggleCreateListener( _icon );
}

ORMOBJ.prototype.close = function( _icon ){
	var id = ""
	if( _icon = 'entity' ){
		id = "icons_entity";
	}
	
	$('#' + id).removeClass('icon')
		.addClass('icon_selected');
		
	
	$('#ui').removeClass('entity_selected');
	
	this.active = false;
	
	master.canvas.ormObj.toggleCreateListener( _icon );
}