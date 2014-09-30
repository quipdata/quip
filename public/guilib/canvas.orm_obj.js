/*	CanvasORMObj: this is the canvas pair of ORMObj. This object
 * 	contains all of the code nessisary to alter the canvas. It is
 * 	a child of the Canvas object.
 */
function CanvasORMObj(){
	this.NAME_REG_EX = /#\/Model\/Model\/ModelObjects\/[a-z0-9]{8}(-[a-z0-9]{4}){3}-[a-z0-9]{12}\/name/

	/*	todo: set x and y
	 * 	id: set to a the proper json pointer to this object ending with a UUID
	 */
	this.groupTemplate = {
		x: 10,
		y: 10,
		draggable: true,
		id: 'UUID'
	}
	
	//	id: set to a the proper json pointer to this object ending with a UUID
	this.entityTemplate = {
		width: 40,
		height: 40,
		stroke: 'black',
		strokeWidth: 1,
		cornerRadius: 8,
		fill: 'white',
		id: 'UUID'
	}
	
	//	id: set to a the proper json pointer to this object ending with a UUID
	this.valueTemplate = {
		width: 40,
		height: 40,
		stroke: 'black',
		strokeWidth: 1,
		cornerRadius: 8,
		fill: 'white',
		id: 'UUID',
		dash: [10, 4]
	}
	
	/*	todo: text must be replace.
	 * 	id: set to a the proper json pointer to this object ending with a UUID
	 * 	y: stored value is the ratio of parent groups height, not the real value.
	 * 		To get real value mutliple stored value by the groups height.
	 */
	this.nameTempalte = {
		x: 5,
		y: .5,
		fontSize: '10pt',
		fontFamily: 'Calibri',
		fill: 'black',
		text: 'REPLACE_ME',
		id: 'UUID'
  	}
	
	/*	todo: text must be replace.
	 * 	id: set to a the proper json pointer to this object ending with a UUID
	 * 	y: stored value is the ratio of parent groups height, not the real value.
	 * 		To get real value mutliple stored value by the groups height.
	 */
	this.nameAndPKTemplate = {
		x: 5,
		y: .375,
		fontSize: '10pt',
		fontFamily: 'Calibri',
		fill: 'black',
		text: 'REPLACE_ME',
		id: 'UUID'
  	}
  	
  	/*	todo: text must be replace.
	 * 	id: set to a the proper json pointer to this object ending with a UUID
	 * 	y: stored value is the ratio of parent groups height, not the real value.
	 * 		To get real value mutliple stored value by the groups height.
	 */
  	this.pkTemplate = {
		x: 5,
		y: .5,
		fontSize: 10,
		fontFamily: 'Calibri',
		fill: 'black',
		text: '(REPLACE_ME)',
		id: 'UUID'
  	}
  	
  	//Set on keydown event that will delete all selected objects
  	$('body').on( 'keydown.ormObjDelete', function( e ){
  		//Check that key pressed is delete
  		if( e.which === 46 ){
  			//Get all select objects ID's and place them into an array
  			var out = [];
			for( var ref in Kinetic.isSelected ){
				var group = Kinetic.isSelected[ ref ];
				
				var visualGroup = getObjPointer( master.model, group.id() );
				
				out[ out.length ] = visualGroup.modelID;
			}
			
			//Deselect the objects
			deselect();
			//Send the ID to be delete to deleteObj in ORMObj 
			master.ormObj.deleteObj( out );
			
			//Reset cursor
			document.body.style.cursor = 'default';
  		}
  	});
}

/*	visualOnlySync: if the change to the object was visual only
 * 	(such as moving or resizing the object). Send the change as
 * 	a transaction without engaging ORMObj. Affects all selected
 * 	objects.
 */
CanvasORMObj.prototype.visualOnlySync = function(){
	var actions = [];
	
	try{
		//Loop over all selected actions and create actions for each.
		for( var group in Kinetic.isSelected ){
			var group = Kinetic.isSelected[ group ];
			
			var newAction = this.createSyncAction( group.getId() );
			actions[actions.length] = newAction;
		}
	}catch( err ){
		throwError( 'canvas.orm_obj.js', 'visualOnlySync', 'Was unable to create syncing action(s)', false );
		return;
	}
	
	try{
		//Turn actions into a transaction and process the transaction
		var trans = master.transaction.createTransaction( 'VisualModel', actions );
		master.transaction.processTransactions( trans );
	}catch( err ){
		throwError( 'canvas.orm_obj.js', 'visualOnlySync', err.message, false );
		return;
	}
}

/*	addObj: add a new objects.
 * 	
 * 	Params:
 * 	_type: type of object to be added. Valid values are: [ 'entity', 'value' ]
 * 	_modelID: the id of the model object this object is lined to.
 * 	_x (optional): position of the new object. If not passed position of the
 * 	mouse will be used.
 * 	_y (optional): position of the new object. If not passed position of the
 * 	mouse will be used.
 * 
 * 	Return:
 * 	a full assembled transaction action (JSON object) is returned.
 */
CanvasORMObj.prototype.addObj = function( _type, _modelID, _x, _y ){
	//New uuids for the group and its child rect
	var newID = uuid.v4();
	var objID = uuid.v4();
	
	//Create group from template
	var groupAttr = cloneJSON( this.groupTemplate );
	
	//If _x or _y is not defined get possition of the mouse
	if( _x == undefined || _y == undefined ){
		var mouse = master.canvas.getMousePos();
		_x = mouse.x;
		_y = mouse.y;	
	}
	//Set position of the group and its ID.
	groupAttr.x = _x;
	groupAttr.y = _y;
	groupAttr.id = "VisualModel/groups/" + newID;
	
	//Create transaction action the contains the new group
	var visualActions = {	
		"objectID" : "#/VisualModel/groups/" + newID,
		"commandType" : "insert",
		"value" : {
		    "type": _type,
		    "id": "VisualModel/groups/"  + newID,
		    "modelID": "#/Model/Model/ModelObjects/" + _modelID,
		    "selectedBy": "default",
		    "attr": groupAttr,
		    "functions": { "makeInteractive" : { "functionName" : "makeInteractive", "params" : [ "VisualModel/groups/"  + newID ] } },
		    "objects": {}
		}
	}
	
	//Get the correct tempalte based upon the _type
	if( _type === 'entity' ){
		var rectAttr = cloneJSON( this.entityTemplate );		
	} else if ( _type === 'value' ){
		var rectAttr = cloneJSON( this.valueTemplate );
	}
	
	//Throw error if _type was not vaild or tempalte did not exist
	if( !rectAttr ){
		throwError( 'canvas.orm_obj.js', 'addObj', 'Passed type of "' + ( !_type ) ? '' : _type + '" is not valid', true );
		return;
	}
	
	//Set new rects ID
	rectAttr.id = "VisualModel/groups/" + newID + "/objects/" + objID;
	
	//Add new rect to the visual action as a child object
	visualActions['value']['objects'][objID] = {
	    "id": "VisualModel/groups/" + newID + "/objects/" + objID,
	    "modelID": "#/Model/Model/ModelObjects/" + _modelID,
	    "class": "Rect",
	    "attr": rectAttr,
	    "functions": {},
	    "links": {"empty":""}
	}
	
	//return the assembled action
	return visualActions;
}

/*	openEditName: opens the editor for changing the objects name
 * 	
 * 	Param: 
 * 	_id: the visualModel id of the object to be renamed
 */
CanvasORMObj.prototype.openEditName = function( _id ){
	//If passed ID is a string change it to the object it points to
	if( typeof _id === 'string' ){
		_id = getObjPointer( master.model, _id );
	}
	
	//If _id is not an object throw an error
	if( typeof _id !== 'object' ){
		throwError( 'canvas.orm_obj.js', 'openEditName', 'Passed _id was either not an object or not a string pointer to an object' );
	}
	
	//If ID is not defined in _id or ID does not point to something in VisualModel/groups throw an error
	if( _id.id == undefined || cleanObjPointer( _id.id ).substring( 0, 18 ) !== 'VisualModel/groups' ){
		throwError( 'canvas.orm_obj.js', 'openEditName', 'Passed _id was not for a VisualModel/groups' )
	}
	
	var attr = _id.attr;
	
	//Set the minimum width to the default in the template
	if( _id.type === 'value' ){
		var minWidth = this.valueTemplate.width;
	} else  {
		var minWidth = this.entityTemplate.width;
	}
	
	//Get current name if it exists and hide the name object
	//Get the maxHeight of any object
	var name = null;
	var maxHeight = 0;
	var rect;
	for( var ref in _id.objects ){
		var object = _id.objects[ref];
		if( object.modelID != undefined && object.modelID.match( this.NAME_REG_EX ) ){
			name = object.attr.text;
			var objName = master.canvas.layer.find( '#' + object.id );
			if( objName.length > 0 ){
				objName[0].hide();
				master.canvas.layer.draw();
			}
		}
		
		if( typeof object.attr.height !== 'undefined' ){
			var height  = parseInt( stripChar( object.attr.height ) );
			if( height  > maxHeight )
				maxHeight = height;
		}
		
		if( typeof object.class === 'string' && object.class === 'Rect' ){
			rect = object;
		}
	}
	
	//If name is still null set to blank
	name = ( name === null ) ? '' : name;
	
	//Get location for the text box
	var targetX = parseInt( attr.x ) + master.canvas.divX + this.nameTempalte.x;
	var targetY = parseInt( attr.y ) + master.canvas.divY  + ( maxHeight / 2 ) - 10;
	
	//Function to detect new width and adjust size of object as nessisary
	var keypress = function(){
		var min = minWidth;
		var width = canvasTextWidth() + 10;
		if( width > min ){
			var obj = master.canvas.layer.find( '#' + rect.attr.id )[0];
			obj.width( width );
			
			master.canvas.layer.draw();
		}
	}
	
	//Function to be called if "enter" is pressed, or someone clicks anywhere
	var saveName = function( _value ){
		//Find name if it exists and set it back to show 
		for( var ref in _id.objects ){
			var object = _id.objects[ref];
			if( object.modelID != undefined && object.modelID.match( this.NAME_REG_EX ) ){
				var objName = master.canvas.layer.find( '#' + object.id );
				if( objName.length > 0 )
					objName[0].show();
				break
			}
		}
		
		//Call function to edit name, passing the modelID and new value
		master.ormObj.editName( _id.modelID, _value );
	}
	
	//Open the text editor
	openCanvasText( targetX, targetY, name, true, true, keypress, saveName );
}

/*	editName: Assembles a visualAction to change the name of the passed
 * 	id to the passed value.
 * 	
 * 	Params:
 * 	_id: id of the visualModel object to be edited
 * 	_value: value to set the name too.
 * 
 * 	Returns (object):
 * 	Valid Visual Action
 */
CanvasORMObj.prototype.editName = function( _id, _value ){
	//Create a visualAction that is equal to the current state of the passed object
	var newAction = this.createSyncAction( _id );
	
	//Extract the actual action
	var visualModel = newAction.value;
	
	//Throw error if action is undefined
	if( visualModel == undefined ){
		throwError( 'canvas.orm_obj.js', 'editName', 'Passed ID must exsist in the VisualModel' );
	}
	
	//Get the canvas group associated with _id. Throw an error if not found
	var group = master.canvas.layer.find( '#' + _id );
	if( group.length === 0 ){
		throwError( 'canvas.orm_obj.js', 'editName', 'Passed ID must exsist on the canvas'  )
	}
	var group = group[0];
	
	//Get the children of the visualModel
	var objects = visualModel.objects;
	
	//If a name object already exists, extract it.
	//Extract rect as well
	var name = null;
	var rect = null;
	for( var ref in objects ){
		var aObject = objects[ref];
		if( aObject.modelID != undefined && aObject.modelID.match( this.NAME_REG_EX ) )
			name = aObject;

		if( aObject.class === 'Rect' )
			rect = aObject;
	}
	
	/*	If the name is new, check to see if its the only text.
	 * 	If it is use the template nameTemplate
	 * 	If not use nameAndPKTemplate.
	 * 	Either way set y as approprate.
	 */
	if( name == null ){
		var template = this.nameTempalte;
		
		for( var ref in objects ){
			var aObject = objects[ref];
			if( aObject.class != undefined && aObject.class === 'Text' && !aObject.modelID.match( this.NAME_REG_EX ) ){
				template = this.nameAndPKTemplate;
				break
			}
		}
		
		//Clone the chosen template
		template = cloneJSON( template );
								
		//Get new UUID
		var objID = uuid.v4();
		
		/*	todo: text must be replace.
		 * 	id: set to a the proper json pointer to this object ending with a UUID
		 * 	y: stored value is the ratio of parent groups height, not the real value.
		 * 		To get real value mutliple stored value by the groups height.
		 */
		template.text = _value;
		template.id = _id + "/objects/" + objID;
		template.y *= group.getInteractiveHeight();
		
		newAction.value.objects[objID] = {
		    "id": _id + "/objects/" + objID,
		    "modelID": visualModel.modelID + '/name',
		    "class": "Text",
		    "attr": template,
		    "functions": {},
		    "links": { "empty":"" }
		};
		
	} else {
		name.attr.text = _value;
		delete name.attr.visible
		master.canvas.layer.find( '#' + name.id )[0].show();
	}
	
	return [ newAction ]
}

/*	findGroupByModelID: takes a model ID and returns the visualModel object
 * 	associated with it.
 * 
 * 	Params:
 * 	_id: valid id to an object in the model
 * 
 * 	Returns (object):
 * 	retunrs visualModel object associated with the object
 */
CanvasORMObj.prototype.findGroupByModelID = function( _id ){
	var visualGroups = master.model.VisualModel.groups;
	
	/*	Loop through groups in the visual model and return the group 
	 * 	associated with the passed modelID
	 */
	for( var aGroup in visualGroups ){
		aGroup = visualGroups[aGroup];
		
		if( aGroup.modelID != undefined && aGroup.modelID === _id ){
			return aGroup;
		}
	}
	
	//If no match was found return undefined
	return undefined;
}

/*	createSyncAction: creates and returns transaction action that will
 * 	sync the visualModel with the current state on the Canvas.
 * 	
 * 	Params:
 * 	_id to an object on the visualModle/Canvas
 * 	
 * 	Returns (object):
 * 	valide visualModel action for a transaction
 */
CanvasORMObj.prototype.createSyncAction = function( _id ){
	//gets the object associated with _id, throws and error if not found
	var visualModel = getObjPointer( master.model, _id );
	if( visualModel == undefined ){
		throwError( 'canvas.orm_obj.js', 'createSyncAction', 'Passed ID must exsist in the VisualModel' );
	}
	
	//get the canvas object associated with the _id, throws and error if not found
	var group = master.canvas.layer.find( '#' + _id );
	if( group.length === 0 ){
		throwError( 'canvas.orm_obj.js', 'createSyncAction', 'Passed ID must exsist on the canvas'  )
	}
	group = group[0];
	
	//Creates visual action at the group level
	var visualActions =	{	
			"objectID" : visualModel.id,
			"commandType" : "update",
			"value" : {
			    "type": visualModel.type,
			    "id": visualModel.id,
			    "modelID": visualModel.modelID,
			    "selectedBy": visualModel.selectedBy,
			    "attr": cleanObjectforJSON( group.getAttrs() ),
			    "functions": visualModel.functions,
			    "objects": {}
			}
		}
	
	//Extracts the objects object from the action for eaiser referance
	var objects = visualActions.value.objects;
	
	/*	Loop through each child ofthe group that has an id. For each object
	 * 	add it to the actions objects object
	 */
	var children = group.getChildren().each( function( child, n ){
		if( child.id() != undefined ){
			var visualChild = getObjPointer( master.model, child.id() );
			if( visualChild == undefined ){
				console.log( "There is a canvas object in the group id '" + _id + "' with the ID '" + child.id() + "' but is not in the VisualModel. This was NOT be added to the sync." )
			} else {	
				objects[ getPointerUUID( child.id() ) ] = {
				    "id": child.id(),
				    "modelID": visualChild.modelID,
				    "class": child.getClassName(),
				    "attr": cleanObjectforJSON( child.getAttrs() ),
				    "functions": ( visualChild.functions == undefined ) ? '' : visualChild.functions,
				    "links": visualChild.links
				}
			}	
		}
	});
	
	return visualActions;
}

/*	toggleCreateListener: toggles on and off a listener for creating new objects.
 * 	Located here because it is only called if someone clicks on the canvas.
 * 
 * 	Params:
 * 	_icon type of lisener to be toggled. Valid values are: [ 'entity', 'value' ]
 */
CanvasORMObj.prototype.toggleCreateListener = function( _icon ){
	if( master.ormObj.active === _icon ){
		master.canvas.backRect.on('click.createListener touchstart.createListener', function(e){
			master.ormObj.addObj( _icon );
		});
	} else {
		master.canvas.backRect.off( '.createListener' );
	}
		
}
