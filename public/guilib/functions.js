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

function getObjPointerParent( _obj, pointer, _lvlsUp ){
	if( _lvlsUp == undefined ) _lvlsUp = 1;
	
	if( pointer.substring( 0, 1) == '#' ) pointer = pointer.substring( 1 );
	if( pointer.substring( 0, 1) == '/' ) pointer = pointer.substring( 1 );
	
	var lvls = pointer.split("/").length - 1;
	lvls -= _lvlsUp;
	
	return getObjPointerParentHelper( _obj, pointer, lvls );
}

function getObjPointerParentHelper( _obj, pointer, _lvls ){
	if( _lvls == -1 ) 
		return _obj;
	
	if( pointer.substring( 0, 1) == '#' ) pointer = pointer.substring( 1 );
	if( pointer.substring( 0, 1) == '/' ) pointer = pointer.substring( 1 );
	
	var slash = pointer.indexOf( '/' );
	if( slash < 0 ) return _obj[pointer];
	
	var segment = pointer.substring( 0, slash );
	
	var nextObj = _obj[segment];
	if( nextObj == undefined ) return undefined;
	
	return getObjPointerParentHelper( nextObj, pointer.substring( slash ), _lvls - 1 );
}

function getPointerUUID( _pointer ){
	var id = _pointer;
	var found = false;
	var i = id.length - 1;
	while( id[i] != '/' )
		i--;
		
	if( id[i] == '/' ){
		id = id.substring( i + 1 );
		return id;
	}
	
	return;
}

function between( _test, _rangeA, _rangeB ){
	if( ( _test >= _rangeA && _test <= _rangeB ) || ( _test >= _rangeB && _test <= _rangeA ) )
		return true;
	
	return false;
}

function JSONStringToHTML( _JSON ){
	var NBS = '&nbsp;&nbsp;';
			
	var output = '';
	var indent = 0;
	for( var i = 0; i < _JSON.length; i++ ){
		if( _JSON[i] == '{' || _JSON[i] == '['  ){						
			indent += 4;
			
			output += _JSON[i] + '<br />'
			
			for( var j = 1; j < indent; j++ )
				output += NBS;
		} else if( _JSON[i] == '}' || _JSON[i] == ']' ){
			indent -= 4
			
			output += '<br />';
			
			for( var j = 1; j < indent; j++ )
				output += NBS;
			
			output += _JSON[i];
		} else if ( _JSON[i] == ',' ){
			output += _JSON[i] + '<br />'
			
			for( var j = 1; j < indent; j++ )
				output += NBS;
		} else {
			output += _JSON[i];
		}
	}
	
	return output;
}

if ( !Date.prototype.toISOString ) {
  ( function() {

    function pad(number) {
      var r = String(number);
      if ( r.length === 1 ) {
        r = '0' + r;
      }
      return r;
    }

    Date.prototype.toISOString = function() {
      return this.getUTCFullYear()
        + '-' + pad( this.getUTCMonth() + 1 )
        + '-' + pad( this.getUTCDate() )
        + 'T' + pad( this.getUTCHours() )
        + ':' + pad( this.getUTCMinutes() )
        + ':' + pad( this.getUTCSeconds() )
        + '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
        + 'Z';
    };

  }() );
}
