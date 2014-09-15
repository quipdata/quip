function Canvas( _width, _height ){
	this.divX = $('#ui').css( 'left' );
	this.divX = parseInt( stripChar( this.divX ) );
	this.divY = $('#ui').css( 'top' );
	this.divY = parseInt( stripChar( this.divY ) );
	
	this.ormObj = new CanvasORMObj();
	
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
	
	this.stage = new Kinetic.Stage({
		container: 'ui',
		width: this.width,
		height: this.height
	});

	this.layer = new Kinetic.Layer();
	this.lineLayer = new Kinetic.Layer();
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
	
	this.stage.add(this.background);
  	this.stage.add(this.lineLayer);
  	this.stage.add(this.layer);
  	
  	this.callableFunctions = [];
  	this.callableFunctions['makeInteractive'] = makeInteractive;
}

Canvas.prototype.getMousePos = function(canvas, evt){
	var mousePos = this.stage.getPointerPosition();
	
	if( mousePos == undefined )
		return undefined;
	
	return {
		x: mousePos.x,
		y: mousePos.y
	};
}

Canvas.prototype.reset = function( _callback ){
	this.layer.removeChildren();
	this.lineLayer.removeChildren();
	
	var groups = master.model.VisualModel.groups;
	
	for( var aGroupRef in groups ){
		if( aGroupRef != "empty" ){
			var aGroup = groups[aGroupRef];
			
			this.processModelGroup( aGroup.id, 'insert' );
			
		}
	}
	
	if( _callback ){
		_callback();
	}
}

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

Canvas.prototype.processModelGroup = function( _id, _commandType ){
	_id = cleanObjPointer( _id );
	
	if( _id.substring( 0, 18 ) != 'VisualModel/groups' ){
		throwError( 'canvas.js', 'processModelGroup', 'Passed path was not for VisualModel or groups container' );
	}
	
	var obj = getObjPointer( master.model, _id );
	var group;
	
	if( _commandType == 'insert' ){
		group = this.layer.find( '#' + _id );
		
		if( group.length > 0 )
			throwError( 'canvas.js', 'processModelGroup', 'command type of insert but the group already existes on the canvas.' );
		
		group = new Kinetic.Group( obj.attr );
		
		if( obj.objects != undefined ){
			for( var objRef in obj.objects ){
				var childObj = obj.objects[objRef];
				var tempObj = new Kinetic[childObj.class](
					childObj.attr
				);
				group.add( tempObj );
			}
		}
		
		this.layer.add( group );
	}
	
	if( _commandType == 'update' ){
		if( obj == undefined )
			throwError( 'canvas.js', 'processModelGroup', 'command type of update but the object does not exist in the visual model' );
		
		group = this.layer.find( '#' + _id );
		group.setAttr( obj.attr );
		
		if( group.length == 0 )		
			throwError( 'canvas.js', 'processModelGroup', 'command type of update but the group does not exist on the canvas' );
			
		if( obj.objects != undefined ){
			for( var objRef in obj.objects ){
				var childObj = obj.objects[objRef];
				
				var tempObj = group.find( '#' + cleanObjPointer( childObj.id ) );
				
				if( tempObj == undefined ){
					tempObj = new Kinetic[childObj.class](
						childObj.attr
					);
					group.add( tempObj );	
				} else {
					tempObj.attr( tempObj.attr );
				}
			}
		}
	}
	
	if( _commandType == 'delete' ){
		if( obj == undefined )
			throwError( 'canvas.js', 'processModelGroup', 'command type of delete but the object does not exist' );
		
		group = this.layer.find( '#' + _id );
		
		if( group.length == 0 )		
			throwError( 'canvas.js', 'processModelGroup', 'command type of delete but the group does not exist on the canvas' );
			
		group.destory();	
	} else {
		if( obj.functions != undefined ){
			this.callCallableFunctions( obj.functions )
		}
		
		if( obj.objects != undefined ){
			for( var objRef in obj.objects ){
				if( tempObj.functions != undefined ){
					this.callCallableFunctions( tempObj.functions )
				}
			}
		}
	}
	
	this.layer.draw();
}

Canvas.prototype.callCallableFunctions = function( _functions ){
	var funRef = ''
	
	for( funRef in _functions ){
		var tempFunction = _functions[funRef]
		if( tempFunction.params == undefined ){
			this.callableFunctions[tempFunction.functionName]()
		} else {
			var params = tempFunction.params;
			
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
