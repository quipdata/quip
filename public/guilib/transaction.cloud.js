/*	pointerToRelativePath: removes # and/or / at the begining of the 
 * 	passed string - converting a absolute path to a relative one.
 * 
 * 	Params:
 * 	_pointer: a string that represent a path
 */
function pointerToRelativePath( _pointer ){
	if( typeof _pointer != 'string' )
		throwError( 'transactoin.cloud.js', 'pointerToRelativePath', '_pointer is not a string' );
		
	if( _pointer.substring( 0, 1) == '#' ) _pointer = _pointer.substring( 1 );
	if( _pointer.substring( 0, 1) == '/' ) _pointer = _pointer.substring( 1 );
	
	return _pointer;
}

/* 	processTransactionsCloudHelper: helper function for processTransactions (on transactions.js).
 * 	This controls processing the action and storing the transactions in the cloud.
 *
 * 	Params: 
 * 	_name: the name of the transaction, should be a UUID
 * 	_transaction: a single transaction as created by createTransaction
 */
Transaction.prototype.processTransactionsCloudHelper = function(  _name, _transaction ){
	this.validateTransaction( _transaction, true );
	
	//Stores the transaction in the cloud
	this.storeTransaction( _name, _transaction );
	
	//Loop through every actions
	var actions = _transaction.Actions;
	
	var action = {};
	var actionID = ""
		
	for( actionID in actions ){
		action = actions[actionID];
	
		//Makes the changes to the obejct log
		this.storeObjectLog( action, _transaction.transactionType );
		
		//Performs the action in the cloud
		this.executeActionsCloud( action );
	}	
}

/*	executeActionsCloud: set position in the cloud that matches
 * 	the object ID to the value of the passed action
 * 	
 * 	Params:
 * 	_action: action to be performed
 */
Transaction.prototype.executeActionsCloud = function( _action ){
	this.validateAction( _action, true )
	
	var path = pointerToRelativePath( _action.objectID );
	var child = this.fbModel.child( path );
	
	if( _action.commandType == 'delete' ){
		child.remove();
	} else {
		child.set( _action.value );
	}
}

/*	storeTransaction: stores the transaction in the cloud. Also pushes a
 * 	pointer to the transaction into the transactionLog.
 *
 * 	Params: 
 * 	_name: the name of the transaction, should be a UUID
 * 	_transaction: a single transaction as created by createTransaction
 */
Transaction.prototype.storeTransaction = function( _name, _transaction ){
	this.validateTransaction( _transaction, true );
	
	/*	Get the correct path to the transaction and transaction log
	 * based upon the transactionType 
	 */
	if( _transaction.transactionType == 'Model' ){
		var transPath = 'Model/Model/TransactionLog/Transactions';
		var transLogPath = 'Model/Model/TransactionLog/TransactionLog';
	} else if ( _transaction.transactionType == 'VisualModel' ){
		var transPath = 'VisualModel/TransactionLog/Transactions';
		var transLogPath = 'VisualModel/TransactionLog/TransactionLog';
	}
	transPath += '/' + _name;
	
	var transChild = this.fbModel.child( transPath );
	transChild.set( _transaction );	
	
	var transLogChild = this.fbModel.child( transLogPath );
	transLogChild.push( _transaction.id );
}

/*	storeObjectLog: replaces the entire contents of the objectLog in
 * 	the cloud with the local copy.
 * 
 * 	Params:
 * 	_action: the action to be added to the object log
 * 	_transactionType: if this is a Model or VisualModel action
 */
Transaction.prototype.storeObjectLog = function( _action, _transactionType ){
	//Validate parameters
	this.validateAction( _action, true );
	
	if( _transactionType != 'Model' && _transactionType != 'VisualModel' )
		throwError( 'transaction.js', 'getReverseAction', '_transactionType are not valid' );
	
	//Get correct paths to storage point in the cloud
	if( _transactionType == 'Model' ){
		var objectLogRoot = master.model.Model.Model.TransactionLog.ObjectLogs;
		var path = 'Model/Model/TransactionLog/ObjectLogs';
	} else {
		var objectLogRoot = master.model.VisualModel.TransactionLog.ObjectLogs;
		var path = 'VisualModel/TransactionLog/ObjectLogs';
	}
	
	//Get local copy
	var objectLogID = getPointerUUID( _action.objectID )
	var objectLog = objectLogRoot[ objectLogID ];
	
	if( objectLog == undefined ){
		errors[errors.length] = [ 'transaction.cloud.js', 'storeObjectLog', 'objectID not found' ]; 
		return;
	}
	
	//store local copy in the cloud
	path += '/' + objectLogID;
	
	var child = this.fbModel.child( path );
	child.set( objectLog );
}

/*	storeFullModelTrans: takes pointers to one or more transactions and
 * 	stores in the in cloud so they can be unwound together
 */
Transaction.prototype.storeFullModelTrans = function( _fullModelTrans ){
	var child = this.fbModel.child( "TransactionLog" );
	child.push( _fullModelTrans )
}
