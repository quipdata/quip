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
		y: .375,
		fontSize: 10,
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
		y: .25,
		fontSize: 10,
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
  	
  	$('body').on( 'keydown.ormObjDelete', function( e ){
  		if( e.which === 46 ){
  			var out = [];
			for( var ref in Kinetic.isSelected ){
				var group = Kinetic.isSelected[ ref ];
				
				var visualGroup = getObjPointer( master.model, group.id() );
				
				out[ out.length ] = visualGroup.modelID;
			}
			
			deselect();
			master.ormObj.deleteObj( out );
			
			document.body.style.cursor = 'default';
  		}
  	});
}

CanvasORMObj.prototype.visualOnlySync = function(){
	var actions = [];
	
	try{
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
		var trans = master.transaction.createTransaction( 'VisualModel', actions );
		master.transaction.processTransactions( trans );
	}catch( err ){
		throwError( 'canvas.orm_obj.js', 'visualOnlySync', err.message, false );
		return;
	}
}

CanvasORMObj.prototype.addObj = function( _type, _modelID, _x, _y ){
	var newID = uuid.v4();
	var objID = uuid.v4();
	
	var groupAttr = cloneJSON( this.groupTemplate );
	//Not this mouse is relative to canvas _mouseX/_mouseY are 
	//relative to the page and  extracted from the triggering event
	if( _x == undefined || _y == undefined ){
		var mouse = master.canvas.getMousePos();
		_x = mouse.x;
		_y = mouse.y;	
	}
	groupAttr.x = _x;
	groupAttr.y = _y;
	groupAttr.id = "VisualModel/groups/" + newID;
	
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
	
	if( _type === 'entity' ){
		var rectAttr = cloneJSON( this.entityTemplate );		
	} else if ( _type === 'value' ){
		var rectAttr = cloneJSON( this.valueTemplate );
	}
	if( !rectAttr ){
		throwError( 'canvas.orm_obj.js', 'addObj', 'Passed type of "' + ( !_type ) ? '' : _type + '" is not valid', true );
		return;
	}
	
	rectAttr.id = "VisualModel/groups/" + newID + "/objects/" + objID;
	
	visualActions['value']['objects'][objID] = {
	    "id": "VisualModel/groups/" + newID + "/objects/" + objID,
	    "modelID": "#/Model/Model/ModelObjects/" + _modelID,
	    "class": "Rect",
	    "attr": rectAttr,
	    "functions": {},
	    "links": {"empty":""}
	}
	
	return visualActions;
}

CanvasORMObj.prototype.openEditName = function( _id ){
	if( typeof _id === 'string' ){
		_id = getObjPointer( master.model, _id );
	}
	
	if( typeof _id !== 'object' ){
		throwError( 'canvas.orm_obj.js', 'openEditName', 'Passed _id was either not an object or not a string pointer to an object' );
	}
	
	if( _id.id == undefined || cleanObjPointer( _id.id ).substring( 0, 18 ) !== 'VisualModel/groups' ){
		throwError( 'canvas.orm_obj.js', 'openEditName', 'Passed _id was not for a VisualModel/groups' )
	}
	
	var attr = _id.attr;
	
	if( _id.type === 'value' ){
		var minWidth = this.valueTemplate.width;
	} else  {
		var minWidth = this.entityTemplate.width;
	}
	
	var maxWidth = 0;
	var maxHeight = 0;
	var rect = null;
	for( var aObj in _id.objects ){
		aObj = _id.objects[aObj];
		
		var aWidth = ( aObj.attr.width == undefined ) ? 0 : parseInt( stripChar( aObj.attr.width ) );		
		maxWidth = ( aWidth > maxWidth  ) ? aWidth : maxWidth;
		
		var aHeight = ( aObj.attr.height == undefined ) ? 0 : parseInt( stripChar( aObj.attr.height ) );		
		maxWidth = ( aHeight > maxHeight  ) ? aHeight : maxHeight;
		
		if( aObj.class === 'Rect' )
			rect = aObj;
	}
	
	//Get current name if it exists
	var name = null;
	for( var ref in _id.objects ){
		var object = _id.objects[ref];
		if( object.modelID != undefined && object.modelID.match( this.NAME_REG_EX ) ){
			name = object.attr.text;
			var objName = master.canvas.layer.find( '#' + object.id );
			if( objName.length > 0 ){
				objName[0].hide();
				master.canvas.layer.draw();
			}
			break
		}
	}
	
	name = ( name === null ) ? '' : name;
	
	var targetX = parseInt( attr.x ) + master.canvas.divX + this.nameTempalte.x;
	var targetY = parseInt( attr.y ) + master.canvas.divY  + ( maxHeight / 2 ) + 5;
	
	var keypress = function(){
		var min = minWidth;
		var width = canvasTextWidth() + 10;
		if( width > min ){
			var obj = master.canvas.layer.find( '#' + rect.attr.id )[0];
			var oldWidth = obj.width();
			obj.width( width );
			
			master.canvas.layer.draw();
		}
	}
	
	var saveName = function( _value ){
		for( var ref in _id.objects ){
			var object = _id.objects[ref];
			if( object.modelID != undefined && object.modelID.match( this.NAME_REG_EX ) ){
				var objName = master.canvas.layer.find( '#' + object.id );
				if( objName.length > 0 )
					objName[0].show();
				break
			}
		}
		
		master.ormObj.editName( _id.modelID, _value );
	}
	
	openCanvasText( targetX, targetY, name, true, keypress, saveName );
}

CanvasORMObj.prototype.editName = function( _id, _value ){
	var newAction = this.createSyncAction( _id );
	
	var visualModel = newAction.value;
	if( visualModel == undefined ){
		throwError( 'canvas.orm_obj.js', 'editName', 'Passed ID must exsist in the VisualModel' );
	}
	
	var group = master.canvas.layer.find( '#' + _id )[0];
	if( group == undefined ){
		throwError( 'canvas.orm_obj.js', 'editName', 'Passed ID must exsist on the canvas'  )
	}
	
	var objects = visualModel.objects;
	
	var name = null;
	for( var ref in objects ){
		var object = objects[ref];
		if( object.modelID != undefined && object.modelID.match( this.NAME_REG_EX ) ){
			name = object;
			break
		}
	}
	
	/*	If the name is new, check to see if its the only text.
	 * 	If it is use the template nameTemplate
	 * 	If not use nameAndPKTemplate and set y of other as approprate.
	 */
	if( name == null ){
		var template = this.nameTempalte;
		
		for( var ref in objects ){
			var aObject = objects[ref];
			if( aObject.class != undefined && aObject.class == 'Text' ){
				template = this.nameAndPKTemplate;
								
				var newY = group.height() * this.pkTemplate.y;
				
				aObject.attr["y"] = newY;
				break
			}
		}
		
		template = cloneJSON( template );
		
		var objID = uuid.v4();
		
		/*	todo: text must be replace.
		 * 	id: set to a the proper json pointer to this object ending with a UUID
		 * 	y: stored value is the ratio of parent groups height, not the real value.
		 * 		To get real value mutliple stored value by the groups height.
		 */
		var height = 0;
		var children = group.getChildren();
		
		for( var i = 0; i < children.length; i++ ){
			if( children[i].name() != 'topLeft' && children[i].name() != 'topRight' && children[i].name() != 'bottomRight' && children[i].name() != 'bottomLeft' ){
				if( ( children[i].x() + children[i].width() ) > height )
					height = children[i].x() + children[i].width();
			}
		}
		
		template.text = _value;
		template.id = _id + "/objects/" + objID;
		template.y *= height;
		
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

CanvasORMObj.prototype.findGroupByModelID = function( _id ){
	var visualGroups = master.model.VisualModel.groups;
	
	for( var aGroup in visualGroups ){
		aGroup = visualGroups[aGroup];
		
		if( aGroup.modelID != undefined && aGroup.modelID === _id ){
			return aGroup;
		}
	}
	
	return undefined;
}

CanvasORMObj.prototype.createSyncAction = function( _id ){
	var visualModel = getObjPointer( master.model, _id );
	if( visualModel == undefined ){
		throwError( 'canvas.orm_obj.js', 'createSyncAction', 'Passed ID must exsist in the VisualModel' );
	}
	
	var group = master.canvas.layer.find( '#' + _id )[0];
	if( group == undefined ){
		throwError( 'canvas.orm_obj.js', 'createSyncAction', 'Passed ID must exsist on the canvas'  )
	}
	
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
	
	objects = visualActions.value.objects;
	
	var group = master.canvas.layer.find( '#' + _id )[0];
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

CanvasORMObj.prototype.toggleCreateListener = function( _icon ){
	if( master.ormObj.active === _icon ){
		master.canvas.backRect.on('click.createListener touchstart.createListener', function(e){
			master.ormObj.addObj( _icon );
		});
	} else {
		master.canvas.backRect.off( '.createListener' );
	}
		
}
