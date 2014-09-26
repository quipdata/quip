function ORMOBJ(){
	this.active = null;
	
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
	
	//objectID and value.id must both be changed to the SAME value
	this.valueTemplate = {	
		"objectID" : "#/Model/Model/ModelObjects/UUID",
		"commandType" : "insert",
		"value" : {
		    "id": "#/Model/Model/ModelObjects/UUID",
		    "name": "",
		    "type": "Value",
		    "notes": "",
		    "ModelRelationshipConnectors": { "empty":"" }
		}
	}
	
	this.massAddObjectCount = 0;
	this.massAddOneForm = '<fieldset><legend>Object ###</legend>';
	this.massAddOneForm += '<label for="mass_add_name_###">Name:</label><input name="mass_add_name_###" id="mass_add_name_###" value=""/>';
	this.massAddOneForm += '<label for="mass_add_type_###">Type:</label><select name="mass_add_type_###" id="mass_add_type_###"><option value="entity">Entity</option><option value="value">Value</option></select></fieldset>';
}

ORMOBJ.prototype.addObj = function( _type ){
	var newModelID = uuid.v4();

	if( _type === 'entity' ){
		var aAction = cloneJSON( this.entityTemplate );	
	} else if( _type === 'value' ) {
		var aAction = cloneJSON( this.valueTemplate );
	}
	
	if( !aAction ){
		throwError( 'orm_obj.js', 'addEntity', 'Passed type of "' + ( !_type ) ? '' : _type + '" is not valid', false );
		return;
	}
	
	aAction.objectID = "#/Model/Model/ModelObjects/" + newModelID;
	aAction.value.id = "#/Model/Model/ModelObjects/" + newModelID;
	
	var actions = [ aAction ];
	
	try{
		var trans = master.transaction.createTransaction( "Model", actions );
	
		var visualActions = master.canvas.ormObj.addObj( _type, newModelID );
		master.canvas.ormObj.openEditName( visualActions.value );
		
		var trans = master.transaction.createTransaction( "VisualModel", [ visualActions ], trans );
		
		master.transaction.processTransactions( trans );
	}catch(err){
		throwError( 'orm_obj.js', 'addEntity', err.message, false );
		return;
	}
}

ORMOBJ.prototype.deleteObj = function( _ids ){
	var modelActions = [];
	var visualActions = [];
	
	for( var i = 0; i < _ids.length; i++ ){
		modelActions[ modelActions.length ] = {	
			"objectID" : _ids[i],
			"commandType" : "delete",
			"value" : null
		}
		
		var aVisualGroup = master.canvas.ormObj.findGroupByModelID( _ids[ i ] );
		if( aVisualGroup != undefined ){
			visualActions[ visualActions.length ] = {
				"objectID" : aVisualGroup.id,
				"commandType" : "delete",
				"value" : null
			}
		}
	}
	
	try{
		var trans = master.transaction.createTransaction( "Model", modelActions );
		
		var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
		
		master.transaction.processTransactions( trans );
	}catch(err){
		throwError( 'orm_obj.js', 'deleteObj', err.message, false );
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
	newAction.commandType = 'update';
	newAction.objectID = _id;
	newAction.value = modelGroup;
	newAction = [ newAction ];
	
	try{
		var trans = master.transaction.createTransaction( "Model", newAction );
		
		var visualGroup = master.canvas.ormObj.findGroupByModelID( _id );
		
		if( visualGroup != undefined ){
			var visualActions = master.canvas.ormObj.editName( visualGroup.id, _value );
			
			var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
		}
		
		master.transaction.processTransactions( trans );
	} catch( err ){
		throwError( 'orm_obj.js', 'editName', err.message, false );
		return;
	}
}

ORMOBJ.prototype.toggle = function( _icon ){
	if( this.active === _icon ){
		this.close( _icon );
	} else {
		this.open( _icon );
	}
}

ORMOBJ.prototype.open = function( _icon ){
	if( this.active === null ){
		var id = ""
		
		switch( _icon ){
			case 'entity':
				id = "icons_entity";
				break;
			case 'value':
				id = "icons_value";		
				break;
		}
		
		$('#' + id).removeClass('icon')
			.addClass('icon_selected');
			
		$('#ui').addClass('entity_selected');
		
		this.active = _icon;
		
		master.canvas.ormObj.toggleCreateListener( _icon );	
	}
}

ORMOBJ.prototype.close = function( _icon ){
	if( this.active === _icon ){
		var id = ""
		switch( _icon ){
			case 'entity':
				id = "icons_entity";
				break;
			case 'value':
				id = "icons_value";		
				break;
		}
		
		$('#' + id).removeClass('icon_selected')
			.addClass('icon');
			
		
		$('#ui').removeClass('entity_selected');
		
		this.active = null;
		
		master.canvas.ormObj.toggleCreateListener( _icon );	
	}
}

ORMOBJ.prototype.openMassAdd = function(){
	$('#wandering_mass_add').show();
	$('#wandering_mass_add').css({'top' : '102px', 'left' : '140px'});
		
	$('#wandering_mass_add_content').html('');
	this.massAddObjectCount = 0;
		
	for( var i = 0; i < 5; i++ ){
		this.addOneForm();
	}
	
	setTimeout(function(){
		$('#mass_add_name_1').focus();
	}, 0);
	
	$('#wandering_mass_add').show();
	
	$('#wandering_mass_add').on( 'keydown.massAdd', function( e ){
		if( !e.shiftKey && e.which === 9 ){
			if( document.activeElement.id === ( 'mass_add_type_' + master.ormObj.massAddObjectCount ) ){
				master.ormObj.addOneForm();
			}
		} else if ( e.which === 13 ){
			master.ormObj.massAdd();
		}
	});
	
}

ORMOBJ.prototype.addOneForm = function(){
	this.massAddObjectCount++;
	
	$('#wandering_mass_add_content').append(
		this.massAddOneForm.replace( /###/g, this.massAddObjectCount )
	);
	
	setTimeout(function(){
		$('#mass_add_name_' + master.ormObj.massAddObjectCount).focus();
	}, 0);
}

ORMOBJ.prototype.closeMassAdd = function(){
	$('#wandering_mass_add').hide();
	$('#wandering_mass_add').off( 'keydown.massAdd' );
}

ORMOBJ.prototype.massAdd = function(){
	var actions = [];
	var visualActions = [];
	
	var totalY = 10;
	var totalX = 10;
	
	for( var i = 1; i <= this.massAddObjectCount; i++ ){
		var newModelID = uuid.v4();
	
		var name = $('#mass_add_name_' + i).val();
		var type = $('#mass_add_type_' + i).val();
		
		if( typeof name === 'string' && name !== '' ){
	
			if( type === 'entity' ){
				var aAction = cloneJSON( this.entityTemplate );
				var y = master.canvas.ormObj.entityTemplate.height;
				var x = master.canvas.ormObj.entityTemplate.width;
			} else if( type === 'value' ) {
				var aAction = cloneJSON( this.valueTemplate );
				var y = master.canvas.ormObj.valueTemplate.height;
				var x = master.canvas.ormObj.valueTemplate.width;
			}
			
			if( !aAction ){
				throwError( 'orm_obj.js', 'massAdd', 'Passed type of "' + ( type ) ? '' : type + '" is not valid', false );
				return;
			}
			
			aAction.objectID = "#/Model/Model/ModelObjects/" + newModelID;
			aAction.value.id = "#/Model/Model/ModelObjects/" + newModelID;
			aAction.value.name = name;
			
			var aVisualAction = master.canvas.ormObj.addObj( type, newModelID, totalX, totalY );
			
			totalY += y + 10;
			if( ( totalY + y ) > master.canvas.height ){
				totalY = 10;
				totalX += x + 10;
			}
			
			var rectAction = null;
			for( var ref in aVisualAction['value']['objects'] ){
				rectAction = aVisualAction['value']['objects'][ ref ];
				break;
			}
			
			var objID = uuid.v4();
			
			var nameAttr = cloneJSON( master.canvas.ormObj.nameTempalte );
			nameAttr.text = name;
			nameAttr.id = aVisualAction['value'].id + "/objects/" + objID;
			nameAttr.y *= rectAction.attr.height;
			
			aVisualAction['value']['objects'][objID] = {
			    "id": aVisualAction['value'].id + "/objects/" + objID,
			    "modelID": aVisualAction['value'].modelID + '/name',
			    "class": "Text",
			    "attr": nameAttr,
			    "functions": {},
			    "links": {"empty":""}
			}
			
			actions[ actions.length ] = aAction;
			visualActions[ visualActions.length ] = aVisualAction;
		}
	}
	
	try{
		var trans = master.transaction.createTransaction( "Model", actions );
		
		var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
		
		master.transaction.processTransactions( trans );
		
		this.closeMassAdd();
	}catch(err){
		throwError( 'orm_obj.js', 'addEntity', err.message, false );
		return;
	}
}
