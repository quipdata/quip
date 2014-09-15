var SELECTED_HEX = '#D1EEEE';

function deselect( _obj ){
	if( Kinetic.multiSelect != null )
		destoryMultiselect();
	
	layers = {}
	
	if( _obj == undefined ){
		for( var group in Kinetic.isSelected ){
			var group = Kinetic.isSelected[ group ];
			var layer = deselectOne( group );
			layers[ layer._id ] = layer;
		}
	} else {
		var layer = deselectOne( _obj );
		layers[ layer._id ] = layer;
	}	
	
	for( var layer in layers ){
		layers[ layer ].draw();
	}
}

function deselectOne( _obj ){	
	_obj.setAttr( 'selected', false );
	_obj.find('.topLeft')[0].hide();
	_obj.find('.topRight')[0].hide();
	_obj.find('.bottomRight')[0].hide();
	_obj.find('.bottomLeft')[0].hide();
	
	delete Kinetic.isSelected[ _obj._id ];
	if( jQuery.isEmptyObject(Kinetic.isSelected) )
		Kinetic.isSelected = null;
	
	return _obj.getLayer();
}

function select( _selected ){
	document.body.style.cursor = 'all-scroll';
	
	_selected.setAttr( 'selected', true );
		
	if( Kinetic.isSelected == null )
		Kinetic.isSelected = {};
	
	Kinetic.isSelected[ _selected._id ] = _selected;
}

function selectStyle(){
	var i = 0;
	for( var group in Kinetic.isSelected ){
		if( i == 0 ){
			i++;
		} else {
			buildMultiselect();
			return;
		}
	}
	
	if( i == 1 ){
		for( var group in Kinetic.isSelected ){
			group = Kinetic.isSelected[ group ];
			
			group.find('.topLeft')[0].show();
			group.find('.topRight')[0].show();
			group.find('.bottomRight')[0].show();
			group.find('.bottomLeft')[0].show();
			
			group.getLayer().draw();
		}
	}
}

function destoryMultiselect(){
	var children = Kinetic.multiSelect.getChildren();
		
	while( children.length > 0 ){
		child = children[0];
		
		if( child.name() == 'selected' ){
			child.destroy();
		} else {
			var tempX = Kinetic.multiSelect.x() + child.x()
			child.setAttr( "x", tempX );
			
			var tempY = Kinetic.multiSelect.y() + child.y();
			child.setAttr( "y", tempY );
			
			var homeLayer = child.getAttr( 'homeLayer' );
			child.moveTo( homeLayer );
			child.draggable( true );
			child.setAttr( 'homeLayer', null );				
		}
	}
			
	Kinetic.multiSelect.destroy();
	Kinetic.multiSelect = null;
}

function buildMultiselect(){
	var minX = null;
	var minY = null;
	var layer = null;
	
	for( var group in Kinetic.isSelected ){
		group = Kinetic.isSelected[ group ];
		layer = group.getLayer();
		break;
	}
	if( Kinetic.multiSelect != null )
		destoryMultiselect();
		
	Kinetic.multiSelect = new Kinetic.Group({
		x: 0,
		y: 0,
		draggable: true
	});
		
	
	Kinetic.multiSelect.on( 'dragstart dragmove dragend', function(){} );
	
	var multiDragStart = Kinetic.multiSelect.eventListeners.dragstart;
	var multiDragMove = Kinetic.multiSelect.eventListeners.dragmove;
	var multiDragEnd = Kinetic.multiSelect.eventListeners.dragend;
	
	var minX = null;
	var maxX = 0;
	var minY = null;
	var maxY = 0;
	
	for( var group in Kinetic.isSelected ){
		group = Kinetic.isSelected[ group ];
		
		if( minX == null || minX > group.x() )
			minX = group.x();
			
		if( maxX < group.x() + group.getWidth() )
			maxX = group.x() + group.getWidth();
			
		if( minY == null || minY > group.y() )
			minY = group.y();
			
		if( maxY < group.y() + group.getHeight() )
			maxY = group.y() + group.getHeight();
		
		group.draggable(false);
		group.setAttr( "homeLayer", group.getLayer() );
		group.moveTo( Kinetic.multiSelect );
		
		var dragstarts = group.eventListeners.dragstart;
		if( dragstarts != undefined ){
			for( var i = 0; i < dragstarts.length; i++ ){
				multiDragStart[ multiDragStart.length ] = dragstarts[i];
			}	
		}
		
		var dragmoves = group.eventListeners.dragmove;
		if( dragmoves != undefined ){ 
			for( var i = 0; i < dragmoves.length; i++ ){
				multiDragMove[ multiDragMove.length ] = dragmoves[i];
			}	
		}
		
		var dragends = group.eventListeners.dragend;
		if( dragends != undefined ){
			for( var i = 0; i < dragends.length; i++ ){
				multiDragEnd[ multiDragEnd.length ] = dragends[i];
			}
		}
		
		group.find('.topLeft')[0].hide();
		group.find('.topRight')[0].hide();
		group.find('.bottomRight')[0].hide();
		group.find('.bottomLeft')[0].hide();	
	}
	
	minX -= 20;
	maxX += 10;
	var tempWidth = maxX - minX;
	minY -= 20;
	minY += 10;
	var tempHeight = maxY - minY
	
	var selected = new Kinetic.Rect({
		x: minX,
		y: minY,
		stroke: SELECTED_HEX,
		strokeWidth: 3,
		width: tempWidth,
		height: tempHeight,
		name: 'selected'
	});
	
	Kinetic.multiSelect.add( selected );
	selected.moveToBottom();
	
	layer.add( Kinetic.multiSelect );
	
	layer.draw();
}

function moveLineSide( _line, _side, _az, _anchor ){
	var points = _line.points();
	
	if( _az == 'a' ){
		points[0] = _side.getCenterX();
		points[1] = _side.getCenterY();
		
		var lineSegment = {
			"point1" : { "x": points[0], "y": points[1] }
			, "point2" : { "x": points[4], "y": points[5] }
		}
	} else {
		points[points.length-2] = _side.getCenterX();
		points[points.length-1] = _side.getCenterY();
		
		var lineSegment = {
			"point1" : { "x": points[points.length-6], "y": points[points.length-5] }
			, "point2" : { "x": points[points.length-2], "y": points[points.length-1] }
		}
	}
	
	var sidePoints = _side.getPoints();
	
	//Top Side
	var sideSegment = {
		point1 : { "x": sidePoints[0].x, "y": sidePoints[0].y }
		, point2 : { "x": sidePoints[1].x, "y": sidePoints[1].y }
	}
	
	var tempPoints = moveLineSideHelper( lineSegment, sideSegment, _az, points, 'top', _anchor );
	
	//Right Side
	if( tempPoints == null ){
		var sideSegment = {
			point1 : { "x": sidePoints[1].x, "y": sidePoints[1].y }
			, point2 : { "x": sidePoints[2].x, "y": sidePoints[2].y }
		}
		
		tempPoints = moveLineSideHelper( lineSegment, sideSegment, _az, points, 'right', _anchor );
	}
	
	//Bottom Side
	if( intersect == null ){
		var sideSegment = {
			point1 : { "x": sidePoints[3].x, "y": sidePoints[3].y }
			, point2 : { "x": sidePoints[2].x, "y": sidePoints[2].y }
		}
		
		tempPoints = moveLineSideHelper( lineSegment, sideSegment, _az, points, 'bottom', _anchor );
	}
	
	//Left Side
	if( intersect == null ){
		var sideSegment = {
			point1 : { "x": sidePoints[0].x, "y": sidePoints[0].y }
			, point2 : { "x": sidePoints[3].x, "y": sidePoints[3].y }
		}
		
		tempPoints = moveLineSideHelper( lineSegment, sideSegment, _az, points, 'left', _anchor );	
	}
	
	if( tempPoints != null )
		points = tempPoints;
	
	_line.points(points);
	_line.getLayer().draw();
}

function moveLineSideHelper( _lineSegment, _sideSegment, _az, _points, _side, _anchor ){
	intersect = findLineIntersect( _lineSegment, _sideSegment );
	if( intersect != null ){
		if( _az == 'a' ){
			var x = _sideSegment.point1.x + ( Math.abs( _sideSegment.point2.x - _sideSegment.point1.x ) / 2 );
			var y = _sideSegment.point1.y + ( Math.abs( _sideSegment.point2.y - _sideSegment.point1.y ) / 2 );
			
			displayPointX = 2
			displayPointY = 3
		} else {
			var x = _sideSegment.point1.x + ( Math.abs( _sideSegment.point2.x - _sideSegment.point1.x ) / 2 );
			var y = _sideSegment.point1.y + ( Math.abs( _sideSegment.point2.y - _sideSegment.point1.y ) / 2 );
			
			displayPointX = _points.length-4
			displayPointY = _points.length-3
		}
		
		if( _anchor == undefined ){
			_points[displayPointX] = x;
			_points[displayPointY] = y;
		} else {
			if( _anchor.getClassName() == "Circle" ){
				x += _anchor.radius();
				y -= _anchor.radius();
			}
			
			switch( _side ){
				case 'top':
					x -= ( _anchor.width() / 2 );
					break;
				case 'right':
					y += ( _anchor.getHeight() / 2 );
					break;
				case 'bottom':
					x -= ( _anchor.width() / 2 );
					y += _anchor.getHeight();
					break;
				case 'left':
					x -= _anchor.width();
					y += ( _anchor.getHeight() / 2 );
					break;
			}
			
			_anchor.x( x );
			_anchor.y( y );
			
			_points[displayPointX] = _anchor.getCenterX();
			_points[displayPointY] = _anchor.getCenterY();
		}
		
		return _points;
	}
	
	return null;
}
	

function addLink( _line, _aSide, _zSide, _aSideAnchor, _zSideAnchor ){
	var points = _line.points();
	points[0] = _aSide.getCenterX();
	points[1] = _aSide.getCenterY();
	points[2] = _aSide.getCenterX();
	points[3] = _aSide.getCenterY();
	points[4] = _zSide.getCenterX();
	points[5] = _zSide.getCenterY();
	points[6] = _zSide.getCenterX();
	points[7] = _zSide.getCenterY();
	
	_line.points(points);

	moveLineSide( _line, _aSide, 'a', _aSideAnchor );
	moveLineSide( _line, _zSide, 'z', _zSideAnchor );

	var aParent = _aSide.getParent();
	var aOn = ( aParent.getType() == 'Group' ) ? aParent : _aSide;
	 
	aOn.on('dragmove', function(){
		moveLineSide( _line, _aSide, 'a', _aSideAnchor );
		moveLineSide( _line, _zSide, 'z', _zSideAnchor );
	});
	
	var zParent = _zSide.getParent();
	var zOn = ( zParent.getType() == 'Group' ) ? zParent : _zSide;
	 	
	zOn.on('dragmove', function(){
		moveLineSide( _line, _aSide, 'a', _aSideAnchor );
		moveLineSide( _line, _zSide, 'z', _zSideAnchor );
	});
}

function makeSizableUpdate(activeAnchor) {
	var MIN_WIDTH = 3;
	var MIN_HEIGHT = 3;
	
	var _group = activeAnchor.getParent();

	var topLeft = _group.find('.topLeft')[0];
	var topRight = _group.find('.topRight')[0];
	var bottomRight = _group.find('.bottomRight')[0];
	var bottomLeft = _group.find('.bottomLeft')[0];

	var anchorX = activeAnchor.x();
	var anchorY = activeAnchor.y();

	// update anchor positions
	switch (activeAnchor.name()) {
		case 'topLeft':
			if( anchorX > bottomRight.x() - MIN_WIDTH ){
				anchorX = bottomRight.x() - MIN_WIDTH;
				activeAnchor.x( anchorX );
			}
		
			if( anchorY > bottomLeft.y() - MIN_HEIGHT ){
				anchorY = bottomLeft.y() - MIN_HEIGHT;
				activeAnchor.y( anchorY );
			}
				
			topRight.y(anchorY);
			bottomLeft.x(anchorX);
		break;
		case 'topRight':
			if( bottomLeft.x() + MIN_WIDTH > anchorX ){
				anchorX = bottomLeft.x()  + MIN_WIDTH;
				activeAnchor.x( anchorX );
			}
		
			if( anchorY > bottomLeft.y() - MIN_HEIGHT ){
				anchorY = bottomLeft.y() - MIN_HEIGHT;
				activeAnchor.y( anchorY );
			}
			
			topLeft.y(anchorY);
			bottomRight.x(anchorX);
	    break;
		case 'bottomRight':
			if( topLeft.x() + MIN_WIDTH > anchorX ){
				anchorX = topLeft.x() + MIN_WIDTH;
				activeAnchor.x( anchorX );
			}
		
			if( topLeft.y() + MIN_HEIGHT > anchorY ){
				anchorY = topLeft.y() + MIN_HEIGHT;
				activeAnchor.y( anchorY );
			}
			
		    bottomLeft.y(anchorY);
		    topRight.x(anchorX); 
	    break;
		case 'bottomLeft':
			if( anchorX > topRight.x() - MIN_WIDTH ){
				anchorX = topRight.x() - MIN_WIDTH;
				activeAnchor.x( anchorX );
			}
		
			if( topRight.y() + MIN_HEIGHT > anchorY ){
				anchorY = topRight.y() + MIN_HEIGHT;
				activeAnchor.y( anchorY );
			}
			
			bottomRight.y(anchorY);
			topLeft.x(anchorX); 
	    break;
	}

    var children = _group.getChildren();
	
	var maxX = 0;
	var maxY = 0;
	var minX = null;
	var minY = null;
	for( var i = 0; i < children.length; i++ ){
		if( children[i].name() != 'topLeft' && children[i].name() != 'topRight' && children[i].name() != 'bottomRight' && children[i].name() != 'bottomLeft' ){
			if( ( children[i].x() + children[i].width() ) > maxX )
				maxX = children[i].x() + children[i].width();
				
			if( ( children[i].y() + children[i].height() ) > maxY )
				maxY = children[i].y() + children[i].height();
				
			if( minX == null || minX > children[i].x() )
				minX = children[i].x();
				
			if( minY == null || minY > children[i].y() )
				minY = children[i].y();
		}
	}
	
	var curWidth = maxX - minX;
	var curHeight = maxY - minY;
	var width = topRight.x() - topLeft.x();
	var height = bottomLeft.y() - topLeft.y();
	if(width && height) {
		var widthRatio = width / curWidth;
		var heightRatio = height / curHeight;
		
		var children = _group.getChildren();
		
		for( var i = 0; i < children.length; i++ ){
			if( children[i].name() != 'topLeft' && children[i].name() != 'topRight' && children[i].name() != 'bottomRight' && children[i].name() != 'bottomLeft' ){
				children[i].width( children[i].getWidth() * widthRatio );
				children[i].height( children[i].getHeight() * heightRatio );

				children[i].x( topLeft.x() + ( ( children[i].x() - minX ) * widthRatio ) );
				children[i].y( topLeft.y() + ( ( children[i].y() - minY ) * heightRatio ) );
			}
		}
	}
}

function makeSizableHelper( _group, _x, _y, _name, _pointer ) {
	var stage = _group.getStage();
	var layer = _group.getLayer();

	var anchor = new Kinetic.Circle({
		x: _x,
		y: _y,
		stroke: '#666',
		fill: SELECTED_HEX,
		strokeWidth: 2,
		radius: 8,
		name: _name,
		draggable: true
	});

	anchor.on('dragmove', function() {
		makeSizableUpdate(this);
		this.getLayer().draw();
	});
	anchor.on('mousedown touchstart', function() {
		_group.setDraggable(false);
		this.moveToTop();
	});
	anchor.on('dragend', function() {
		_group.setDraggable(true);
		this.getLayer().draw();
	});
	// add hover styling
	anchor.on('mouseover', function() {
		document.body.style.cursor = _pointer;
		this.setStrokeWidth(4);
		this.getLayer().draw();
	});
	anchor.on('mouseout', function() {
		document.body.style.cursor = 'default';
		this.strokeWidth(2);
		this.getLayer().draw();
	});
	
	_group.add(anchor);
	anchor.hide();
}

//	Run after adding all inital shapes to the group!!!
function makeInteractive( _group ){
	if( typeof _group == 'string' ){
		_group = master.canvas.stage.find( '#' + _group )[0];
	}
	
	maxWidth = _group.getWidth();
	maxHeight = _group.getHeight();
	
	makeSizableHelper( _group, 0, 0, 'topLeft', 'nwse-resize' );
	makeSizableHelper( _group, maxWidth, 0, 'topRight', 'nesw-resize' );
	makeSizableHelper( _group, 0, maxHeight, 'bottomLeft', 'nesw-resize' );
	makeSizableHelper( _group, maxWidth, maxHeight, 'bottomRight', 'nwse-resize' );
	
	var topLeft = _group.find('.topLeft')[0];
	var topRight = _group.find('.topRight')[0];
	var bottomRight = _group.find('.bottomRight')[0];
	var bottomLeft = _group.find('.bottomLeft')[0];
	
	_group.setAttr( 'selected', false );
	
	_group.on('click touchstart', function(e){
		if( !_group.getAttr( 'selected' ) || Kinetic.multiSelect != null || !e.evt.shiftKey || !e.evt.ctrlKey ){
			//If shif and cntrl were not held during the click
			if( !e.evt.shiftKey && !e.evt.ctrlKey ){
				deselect();
				select( _group );
			} else if ( _group.getAttr( 'selected' ) ) {
			//If shif or cntrl were held during the click and object was already selected
				deselect( _group );
			} else {
			//If shif and cntrl were held during the click and object was not already selected
				select( _group );
			}
		
			selectStyle();
		}
	});
	
	_group.on('dragstart', function(e){
		if( !_group.getAttr( 'selected' ) ){
			//If shif and cntrl were not held during the click
			if( !e.evt.shiftKey && !e.evt.ctrlKey ){
				deselect();
				select( _group );
			} else if ( _group.getAttr( 'selected' ) ) {
			//If shif or cntrl were held during the click and object was already selected
				deselect( _group );
			} else {
			//If shif and cntrl were held during the click and object was not already selected
				select( _group );
			}
			
			selectStyle();
		}
	});
	
	_group.on('mouseover', function() {
		if( document.body.style.cursor == 'default' && _group.getAttr( 'selected' ) )
			document.body.style.cursor = 'all-scroll';
	});
	
	_group.on('mouseout', function() {
		document.body.style.cursor = 'default';
  	});
}


/*	Finds where two lines inersect when the lines are, each defined as a struct with below:
{
	"point1" : { "x": 0, "y": 0 },
	"point2" : { "x": 100, "y": 100 }
}

return the intercept point as the struct below:
{
	"x" : 0,
	"y" : 0
}
*/
function findLineIntersect( lineA, lineB ){
	var den = ( ( lineB.point2.x - lineB.point1.x ) * ( lineA.point1.y - lineA.point2.y ) ) - ( ( lineA.point1.x - lineA.point2.x ) * ( lineB.point2.y - lineB.point1.y ) )
	
	if( den == 0 )
		return null;
		
	var ta = ( ( ( lineB.point1.y - lineB.point2.y ) * ( lineA.point1.x - lineB.point1.x ) ) + ( ( lineB.point2.x - lineB.point1.x ) * ( lineA.point1.y - lineB.point1.y ) ) ) / den;
	
	if( !between( ta, 0, 1 ) )
		return null;
	
	var tb = ( ( ( lineA.point1.y - lineA.point2.y ) * ( lineA.point1.x - lineB.point1.x ) ) + ( ( lineA.point2.x - lineA.point1.x ) * ( lineA.point1.y - lineB.point1.y ) ) ) / den;
	
	if( !between( tb, 0, 1 ) )
		return null;
		
	var xa = lineA.point1.x + ta * ( lineA.point2.x - lineA.point1.x );
	var ya = lineA.point1.y + ta * ( lineA.point2.y - lineA.point1.y );
	
	return { x: xa, y: ya }
}
