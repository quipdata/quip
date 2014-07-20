function getObjPointer( _obj, pointer ){
	if( pointer.substring( 0, 1) == '#' ) pointer = pointer.substring( 1 );
	if( pointer.substring( 0, 1) == '/' ) pointer = pointer.substring( 1 );
	
	var slash = pointer.indexOf( '/' );
	if( slash < 0 ) return _obj[pointer];
	
	var segment = pointer.substring( 0, slash );
	
	var nextObj = _obj[segment];
	if( nextObj == undefined ) return undefined;
	
	return getObjPointer( nextObj, pointer.substring( slash ) );
}

function between( _test, _rangeA, _rangeB ){
	if( ( _test >= _rangeA && _test <= _rangeB ) || ( _test >= _rangeB && _test <= _rangeA ) )
		return true;
	
	return false;
}
