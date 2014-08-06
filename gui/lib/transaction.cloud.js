function pointerToRelativePath( _pointer ){
	if( _pointer.substring( 0, 1) == '#' ) _pointer = _pointer.substring( 1 );
	if( _pointer.substring( 0, 1) == '/' ) _pointer = _pointer.substring( 1 );
	
	return _pointer;
}

function processTransactionsCloudHelper(  _name, _transaction ){
	storeTransaction( _name, _transaction );

	var actions = _transaction.Actions;
	
	var action = {};
	var actionID = ""
		
	for( actionID in actions ){
		action = actions[actionID];
	
		storeObjectLog( action, _transaction.transactionType );
		
		executeActionsCloud( action );
	}	
}

function executeActionsCloud( _action ){
	var path = pointerToRelativePath( _action.objectID );
	var child = fbModel.child( path );
	child.set( _action.value );
}

function storeTransaction( _name, _transaction ){
	if( _transaction.transactionType == 'Model' ){
		var transPath = 'Model/Model/TransactionLog/Transactions';
		var transLogPath = 'Model/Model/TransactionLog/TransactionLog';
	} else {
		var transPath = 'VisualModel/TransactionLog/Transactions';
		var transLogPath = 'VisualModel/TransactionLog/TransactionLog';
	}
	transPath += '/' + _name;
	
	var transChild = fbModel.child( transPath );
	transChild.set( _transaction );	
	
	var transLogChild = fbModel.child( transLogPath );
	transLogChild.push( _transaction.id );
}

function storeObjectLog( _action, _transactionType ){
	if( _transactionType == 'Model' ){
		var objectLogRoot = model.Model.Model.TransactionLog.ObjectLogs;
		var path = 'Model/Model/TransactionLog/ObjectLogs';
	} else {
		var objectLogRoot = model.VisualModel.TransactionLog.ObjectLogs;
		var path = 'VisualModel/TransactionLog/ObjectLogs';
	}
	
	var objectLogID = "";
	var objectLog = {};
	found = false
	for( objectLogID in objectLogRoot ){
		if( objectLogID != "empty" ){
			objectLog = objectLogRoot[objectLogID];
			if( objectLog.objectID == _action.objectID ){
				found = true;
				break;
			}
		}
	}
	
	if( found == false ){
		errors[errors.length] = [ 'transaction.cloud.js', 'storeObjectLog', 'objectID not found' ]; 
		return;
	}
	
	path += '/' + objectLogID;
	
	var child = fbModel.child( path );
	child.set( objectLog );
}

function storeFullModelTrans( _fullModelTrans ){
	var child = fbModel.child( "TransactionLog" );
	child.push( _fullModelTrans )
}
