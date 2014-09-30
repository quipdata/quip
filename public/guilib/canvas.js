/*	Canvas: this is object controls and is children control all aspects
 * 	of canvas manipulation. It is split into its own file so if future
 * 	developers want to move away from the KineticJS library for canvas
 * 	manipulation all of the code is sequestored into specific files.
 * 
 * 	Params:
 * 	_width (optional): Defines the width of the Canvas. If not passed
 * 	the width of div the canvas will be added to will be used.
 * 	_height (optional): Defines the height of the Canvas. If not passed
 * 	the height of div the canvas will be added to will be used.
 */
function Canvas( _width, _height ){
	//Gets location for the div that contains the canvas.
	this.divX = $('#ui').css( 'left' );
	this.divX = parseInt( stripChar( this.divX ) );
	this.divY = $('#ui').css( 'top' );
	this.divY = parseInt( stripChar( this.divY ) );
	
	/*	Spawns ormObj object for Canvas. This is the pair of
	 * 	ORMOBJ which control the non-canvas aspects of object manipulation
	 */ 
	this.ormObj = new CanvasORMObj();
	
	//Next two blocks get width and height.
	if( _width == undefined ){
		this.width = stripChar( $('#ui').css( 'width' ) );
	} else {
		this.width = _width;
	}
	
	if( _height == undefined ){
		this.height = stripChar( $('#ui').css( 'height' ) );
	} else {
		this.height = _height;
	}	
	
	//Sets up Kinetic stage
	this.stage = new Kinetic.Stage({
		container: 'ui',
		width: this.width,
		height: this.height
	});

	//Creates main layer, for objects
	this.layer = new Kinetic.Layer();
	/*	Creates the layer for lines. They are on they're own
	 * 	layer so that they are always behind any object
	 */ 
	this.lineLayer = new Kinetic.Layer();
	/*	Next four blocks  create background layer, this layer contains a single rect
	 * 	with a white background that convers the entire canvas. This
	 * 	allow you to bind events to clicking the background of the canvas
	 */
	this.background = new Kinetic.Layer();
	
	this.backRect = new Kinetic.Rect({
		width: this.width,
		height: this.height
	});
	
	this.backRect.on('click touchstart', function(e){
		if( !e.evt.shiftKey && !e.evt.ctrlKey )
			deselect();
	});
	
	this.background.add( this.backRect );
	
	//Add layers to stage
	this.stage.add(this.background);
  	this.stage.add(this.lineLayer);
  	this.stage.add(this.layer);
  	
  	/*	This object stores functions that can be called to manipulate
  	 * 	Kinteic objects upon creation to make them more interactive.
  	 */
  	this.callableFunctions = [];
  	this.callableFunctions['makeInteractive'] = makeInteractive;
}

/*	getMousePos: obtains the current position of the mouse over the
 * 	canvas object.
 * 
 * 	params:
 * 	Parameters do not need to be passed, call: var mouse = master.canvas.getMousePos();
 * 	
 * 	returns (object):
 * 	returns objects with two properties "x" and "y" that contain the X
 * 	and Y coordinates of the mouse pointer relative to the canvas (i.e. 0,0 is the top of 
 * 	canvas not the page).
 */
Canvas.prototype.getMousePos = function(canvas, evt){
	var mousePos = this.stage.getPointerPosition();
	
	if( mousePos == undefined )
		return undefined;
	
	return {
		x: mousePos.x,
		y: mousePos.y
	};
}

/*	reset: resets clears the canvas and resets it back to the current
 * 	contents of the visualModel
 * 
 * 	Params:
 * 	_callback: function to be called once reset is complete
 */
Canvas.prototype.reset = function( _callback ){
	//Clear the canvas
	this.layer.removeChildren();
	this.lineLayer.removeChildren();
	
	//Gets all groups from visual model
	var groups = master.model.VisualModel.groups;
	
	//Loop over all groups and process each
	for( var aGroupRef in groups ){
		if( aGroupRef != "empty" ){
			var aGroup = groups[aGroupRef];
			
			this.processModelGroup( aGroup.id, 'insert' );
			
		}
	}
	
	//Call callback function
	if( typeof _callback === 'function' ){
		_callback();
	}
}

/*	processModelUI: takes an id to a location on the visual
 * 	model and a command type and sends the command to the 
 * 	appropreate function.
 * 
 * 	Params:
 * 	_id: id to a location in the visual model
 * 	_commandType: type of command to be performed 
 * 	Valid values are: [ 'insert', 'update', 'delete' ]
 */
Canvas.prototype.processModelUI = function( _id, _commandType ){
	_id = cleanObjPointer( _id );
	
	if( _id.substring( 0, 18 ) == 'VisualModel/groups' ){
		this.processModelGroup( _id, _commandType );
		return;
	}
	
	if( _id.substring( 0, 17 ) == 'VisualModel/links' ){
		this.processModelLinks( _id, _commandType );
		return;
	}
	
	if( _id.substring( 0, 20 ) == 'VisualModel/comments' ){
		this.processModelLinks( _id, _commandType );
		return;
	}
}

/*	processModelGroup: processes a model group id in the visual model
 * 	perfroming the nessiary actions to place it on the canvas.
 * 
 * 	Params:
 * 	_id: id to an object withing the VisualModel/groups container in the
 * 	visualModel
 * 	_commandType: type of command to be performed 
 * 	Valid values are: [ 'insert', 'update', 'delete' ]
 */
Canvas.prototype.processModelGroup = function( _id, _commandType ){
	//Remove leading characters # or /
	_id = cleanObjPointer( _id );
	
	//Test to make sure the objects is in the correct container
	if( _id.substring( 0, 18 ) != 'VisualModel/groups' ){
		throwError( 'canvas.js', 'processModelGroup', 'Passed path was not for VisualModel or groups container' );
	}
	
	//Get object
	var obj = getObjPointer( master.model, _id );
	
	if( obj == undefined )
		throwError( 'canvas.js', 'processModelGroup', 'Passed path was not found' );
	
	var group;
	
	//Block for insert
	if( _commandType == 'insert' ){
		//look for id in the canvas and throw error if it exists
		group = this.layer.find( '#' + _id );
		
		if( group.length > 0 )
			throwError( 'canvas.js', 'processModelGroup', 'command type of insert but the group already existes on the canvas.' );
		
		//Create group with passed attributes
		group = new Kinetic.Group( obj.attr );
		
		//Create all of the group's children and add to the group
		if( obj.objects != undefined ){
			for( var objRef in obj.objects ){
				var childObj = obj.objects[objRef];
				var tempObj = new Kinetic[childObj.class](
					childObj.attr
				);
				group.add( tempObj );
			}
		}
		
		//Add to the layer
		this.layer.add( group );
	}
	
	//Block for updates
	if( _commandType == 'update' ){
		//Get the group on the canvas
		group = this.layer.find( '#' + _id );
		
		//If group does not exist throw an error
		if( group.length === 0 )		
			throwError( 'canvas.js', 'processModelGroup', 'command type of update but the group does not exist on the canvas' );
			
		//Retrun value is an array, there should only be on item in the array, so get it
		canvasGroup = group[0];
		
		//Set attributes
		canvasGroup.setAttrs( obj.attr );
		
		//Get children of canvas object
		var children = canvasGroup.getChildren().toArray();
		
		/*	Loop through the canvas objects children with an ID 
		 * 	All objects on the visual model, and only objects on the visual model,
		 * 	will have an ID set (others may have a name, but not an ID)
		 */
		for( var i = 0; i < children.length; i++ ){
			var child = children[i];
			
			if( child.getId() != undefined ){
				//Use the ID to find it on the visual model
				var visualModelChild = getObjPointer( master.model, child.getId() );
				//If the child exists on the visualModel set its attributes, otherwise destory it
				if( visualModelChild == undefined ){
					child.destroy();
				} else {
					child.setAttrs( visualModelChild.attr );
				}
			}
		}
		
		/*	Loop though objects in the visual model looking for objects that are not
		 * 	on the canvas. If found add them to the group.
		 */
		for( var ref in obj.objects ){
			var visualModelChild = obj.objects[ ref ];

			var canvasChild = this.layer.find( '#' + cleanObjPointer( visualModelChild.id ) )[0];
			
			if( canvasChild == undefined ){
				var tempObj = new Kinetic[ visualModelChild["class"] ](
					visualModelChild.attr
				);
				canvasGroup.add( tempObj );
			}
		}
	}
	
	//Block for delete
	if( _commandType == 'delete' ){
		//Find the object on the canvas
		group = this.layer.find( '#' + _id );
		
		/*	Destory the object. No error is thrown if not found
		 * 	since this will be called twice, once locally and once
		 * 	when the change comes down from Firebase
		 */
		if( group.length > 0 ){
			group = group[0];
			
			group.destroy();
		}
	} else {
	//Block to perform for both inserts and updates
		//If there are group level functions to call, call them
		if( obj.functions != undefined && obj.functions != '' ){
			this.callCallableFunctions( obj.functions )
		}
		
		//If there are children level functions to call, call them
		if( obj.objects != undefined ){
			for( var objRef in obj.objects ){
				var tempObj = obj.objects[ objRef ];
				
				if( tempObj.functions != undefined && tempObj.functions != '' ){
					this.callCallableFunctions( tempObj.functions )
				}
			}
		}
	}
	
	//Update layer
	this.layer.draw();
}

/*	callCallableFunctions: helper function that calls functions defined
 * 	in the visualModel.
 * 
 * 	Params:
 * 	_functions: this is the entire functions object defined in the visual
 * 	model. Defined as:
"functions" : {
	"type" : "array",
	"items" : {
		"type" : "object",
		"properties" : {
			//name of function to be called
			"functionName" : { "type" : "string" }
			//an actuall array (NOT an object since order is important) of parameters
			"parameters" : { "type" : "array", "items" : "string" }
		} 
	}
}
 */
Canvas.prototype.callCallableFunctions = function( _functions ){
	for( var funRef in _functions ){
		var tempFunction = _functions[funRef]
		//If not parameters just call the function
		if( tempFunction.params == undefined ){
			this.callableFunctions[tempFunction.functionName]()
		} else {
			//Get parameters
			var params = tempFunction.params;
			
			//switch is used to call the functions with up to five parameters
			switch( params.length ){
				case 0:
					this.callableFunctions[tempFunction.functionName]()
				break;
				case 1:
					this.callableFunctions[tempFunction.functionName]( params[0] )
				break;
				case 2:
					this.callableFunctions[tempFunction.functionName]( params[0], params[1] )
				break;
				case 3:
					this.callableFunctions[tempFunction.functionName]( params[0], params[1], params[2] )
				break;
				case 4:
					this.callableFunctions[tempFunction.functionName]( params[0], params[1], params[2], params[3] )
				break;
				case 5:
					this.callableFunctions[tempFunction.functionName]( params[0], params[1], params[2], params[3], params[4] )
				break;
			}	
		}
	}
}
