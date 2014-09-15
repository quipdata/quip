function CanvasORMObj(){
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
}

CanvasORMObj.prototype.addEntity= function( _modelID ){
	var newID = uuid.v4();
	var objID = uuid.v4();
	
	var groupAttr = cloneJSON( this.groupTemplate );
	//Not this mouse is relative to canvas _mouseX/_mouseY are 
	//relative to the page and  extracted from the triggering event
	var mouse = master.canvas.getMousePos();
	groupAttr.x = mouse.x;
	groupAttr.y = mouse.y;
	groupAttr.id = "VisualModel/groups/" + newID;
	
	var visualActions = [
		{	
			"objectID" : "#/VisualModel/groups/" + newID,
			"commandType" : "insert",
			"value" : {
			    "type": "Entity",
			    "id": "VisualModel/groups/"  + newID,
			    "modelID": "#/Model/Model/ModelObjects/" + _modelID,
			    "selectedBy": "default",
			    "attr": groupAttr,
			    "functions": { "makeInteractive" : { "functionName" : "makeInteractive", "params" : [ "VisualModel/groups/"  + newID ] } },
			    "objects": {}
			}
		}
	]
	
	var rectAttr = cloneJSON( this.entityTemplate );
	rectAttr.id = "VisualModel/groups/" + newID + "/objects/" + objID;
	
	visualActions[0]['value']['objects'][objID] = {
	    "id": "VisualModel/groups/" + newID + "/objects/" + objID,
	    "modelID": "#/Model/Model/ModelObjects/" + _modelID,
	    "class": "Rect",
	    "attr": rectAttr,
	    "functions": {},
	    "links": {"empty":""}
	}
	
	this.openEditName( visualActions[0].value );
	
	return visualActions;
}

CanvasORMObj.prototype.openEditName = function( _id ){
	if( typeof _id == 'string' ){
		_id = getObjPointer( master.model, _id );
	}
	
	if( typeof _id != 'object' ){
		throwError( 'canvas.orm_obj.js', 'openEditName', 'Passed _id was either not an object or not a string pointer to an object' );
	}
	
	if( _id.id == undefined || cleanObjPointer( _id.id ).substring( 0, 18 ) != 'VisualModel/groups' ){
		throwError( 'canvas.orm_obj.js', 'openEditName', 'Passed _id was not for a VisualModel/groups' )
	}
	
	var attr = _id.attr;
	
	if( _id.type == 'value' ){
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
		
		if( aObj.class = 'Rect' )
			rect = aObj;
	}
	
	var targetX = parseInt( attr.x ) + master.canvas.divX + ( maxWidth / 2 );
	var targetY = parseInt( attr.y ) + master.canvas.divY  + ( maxHeight / 2 ) + 5;
	
	var keypress = function(){
		var min = minWidth;
		var width = canvasTextWidth() + 10;
		if( width > min ){
			var obj = master.canvas.layer.find( '#' + rect.attr.id )[0];
			var oldWidth = obj.width();
			obj.width( width );
			
			var group = master.canvas.layer.find( '#' + _id.attr.id )[0];
			var newX = group.x();
			newX += ( oldWidth - width ) / 2;
			group.x( newX );
			
			master.canvas.layer.draw();
		}
	}
	
	var saveName = function( _value ){
		master.ormObj.editName( _id.modelID, _value );
	}
	
	openCanvasText( targetX, targetY, '', true, keypress, saveName );
}

CanvasORMObj.prototype.editName = function( _id, _value ){
	var nameRegEx = /#\/Model\/Model\/ModelObjects\/[a-z0-9]{8}(-[a-z0-9]{4}){3}-[a-z0-9]{12}\/name/
	
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
	
	var newAction = this.createSyncAction( _id );
	
	var name = null;
	for( name in objects ){
		name = object[name];
		if( object.modelID != undefined && object.modelID.match( nameRegEx ) ){
			name = object;
			break
		}
	}
	
	/*	If the name is new, check to see if its the only text.
	 * 	If it is use the template nameTemplate
	 * 	If not use nameAndPKTemplate and set y of other as approprate.
	 */
	if( name == null ){
		for( name in objects ){
			var aObject = object[name];
			if( aObject.class != undefined && aObject.class == 'Text' ){
				var template = this.nameAndPKTemplate;
								
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
		template.text = _value;
		template.id = _id + "/objects/" + objID;
		template.y *= group.height();
		
		newAction.objects[objID] = {
		    "id": _id + "/objects/" + objID,
		    "modelID": visualModel.modelID + '/name',
		    "class": "Text",
		    "attr": template,
		    "functions": {},
		    "links": { "empty":"" }
		};
		
	} else {
		var newAction = this.createSyncAction( _id );
	}
	
	return newAction;
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
	
	var visualActions = [
		{	
			"objectID" : visualModel.id,
			"commandType" : "update",
			"value" : {
			    "type": "visualModel.type",
			    "id": visualModel.id,
			    "modelID": visualModel.modelID,
			    "selectedBy": visualModel.selectedBy,
			    "attr": group.getAttrs(),
			    "functions": visualModel.functions,
			    "objects": {}
			}
		}
	]
	
	var rectAttr = cloneJSON( this.entityTemplate );
	rectAttr.id = visualModel.id + "/objects/" + objID;
	
	objects = visualActions[0].value.objects;
	
	var group = master.canvas.layer.find( '#' + id )[0];
	var childeren = group.getChildren().toArray();
	
	for( var i = 0; i < children.length; i++ ){
		var child = children[i];
		
		if( child.id() != undefined ){
			var visualChild = getObjPointer( master.model, child.id() );
			if( visualChild == undefined ){
				console.log( "There is a canvas object in the group id '" + _id + "' with the ID '" + child.id() + "' but is not in the VisualModel. This was NOT be added to the sync." )
			} else {	
				objects[ child.id() ] = {
				    "id": child.id(),
				    "modelID": visualChild.modelID,
				    "class": child.className(),
				    "attr": child.getAttrs(),
				    "functions": visualChild.functions,
				    "links": visualChild.links
				}
			}	
		}
	}
	
	return visualActions;	
}

CanvasORMObj.prototype.toggleCreateListener = function( _icon ){
	if( typeof master.ormObj.active == 'boolean' && master.ormObj.active ){
		if( _icon == 'entity' ){
			master.canvas.backRect.on('click.createListener touchstart.createListener', function(e){
				master.ormObj.addEntity();
			});
		}
	} else {
		if( _icon == 'entity' ){
			master.canvas.backRect.off( '.createListener' );
		}	
	}
		
}
