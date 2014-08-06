/*	createTransaction: helper function used to package transactions.
 * 	this function can only package 1 transaction, either a Model or
 * 	VisualModel. A single transaction can of course affect any number
 * 	of objects in either the Model or VisualModel using multiple actions.
 * 	If both the Model and VisualModel were affected you should use this function
 * 	to create two transactions (one for both model types), passing the first
 * 	transaction into _masterTran when you create the second. This will 
 * 	package both transactions into a single master transaction so that both
 * 	will be rolled back at the sametime. 
 * 
 * 	Params: 
 * 	_transacationType: the type of transaction to be created.
 * 	valid values: [ "Model", "VisualModel" ].
 * 	_actionsParam: array of objects. Each object should be as follows:
 * 	{
 * 		"objectID" : { "type" : "string" },
 * 		"commandType" : { "type" : "string", "enum" : [ "insert", "update", "delete" ] },
 * 		"value" : { "type" : "object" }
 * 	}
 * 	_masterTran (optional) : if provided the transaction created by this function 
 * 	will be appended to this object.
 */
function createTransaction( _transactionType, _actionsParams, _masterTran ){
	if( _transactionType == undefined || ( _transactionType != 'Model' && _transactionType != 'VisualModel' )
		throwError( 'transactoin.js', 'createTransaction', '_transactionType not provided or not a valid value' );
	if( _actionsParams == undefined ) 
		throwError( 'transactoin.js', 'createTransaction', '_actionParams not provided' );
	
	var trans = {};	//Object to be returned
	
	//UUID for the transaction.
	var transID = uuid.v4();
	
	/*	Based upon kind of transaction to be created, specifies path where 
	 * 	this transaction will be stored. Also sets the changeUI and changeRemote
	 * 	values for the actions.
	 */
	if( _transactionType == 'Model' ){
		var transPointer = "#/Model/Model/TransactionLog/Transactions/" + transID;
		var _changeUI = false;
		var _changeRemote = true;
	} else if ( _transactionType == 'VisualModel' ){
		var transPointer = "#/VisualModel/TransactionLog/Transactions/" + transID;
		var _changeUI = true;
		var _changeRemote = true;
	}
	
	//Get current date as a string in ISO 8601 standard
	var modifiedOn = new Date();
	modifiedOn = modifiedOn.toISOString();
	
	//Build transaction without actions
	trans[transID] = {
	    "id": transPointer,
	    "transactionType" : _transactionType,
		"modifiedBy": userID,
		"modifiedOn": modifiedOn,
		"Actions": {}
	}
	
	//Loop over each action and add it to the transaction
	for( var i = 0; i < _actionsParams.length; i++ ){
		//UUID for this action
		var actionID = uuid.v4();
		
		if( _actionsParams[i].objectID == undefined ) 
			throwError( 'transactoin.js', 'createTransaction', 'objectID provided for at leaset one actionParam' );
		if(  _actionsParams[i].commandType == undefined 
		|| ( _actionsParams[i].commandType != 'insert' && _actionsParams[i].commandType != 'update' && _actionsParams[i].commandType != 'delete' ){
			throwError( 'transactoin.js', 'createTransaction', 'commandType not provided or invalid for at leaset one actionParam' );		
		}
	
		trans[transID]["Actions"][actionID] = {
			"id": transPointer + "/Actions/" + actionID,
			"objectID": _actionsParams[i].objectID,
			"changeUI": _changeUI,
			"changeRemote": _changeRemote,
			"commandType": _actionsParams[i].commandType,
	        "value": _actionsParams[i].value
		}
	}	
	
	//if _masterTran is populated add trans to it
	if( _masterTran != undefined && typeof _masterTran == 'object' ){
		var temp = trans;
		var trans = _masterTran;
		
		var id = "";
		for( id in temp ){
			trans[id] = temp[id];
		}
	}
	
	return trans;
}

/*	processTransactions: takes a transaction as returned by createTransaction
 * 	and changes the underlying JSON model(s) per the actions within the
 * 	transaction. 
 * 
 * 	While processing the actions this will also append the informaiton nessisary 
 * 	to reverse the transaction, and stores all of the information nessisary to 
 * 	do so. Finally it takes care of storing the data in the cloud so it can be 
 * 	synced with any other users.
 *  
 * 	Params: 
 * 	_transaction: a transaction as returned by createTransaction
 */
function processTransactions( _transaction ){
	/*	A container used to create a super transaction stored above 
	 * 	the model and visualModel transactions so that changes that 
	 * 	affect both objects can be reversed at the same time.
	 */ 
	var fullModelTrans = {};
	
	//Loop through every transaction in the passed transaction
	var name = ""
	var transaction = {};
	for( name in _transaction ){
		transaction = _transaction[name];
		
		//Stores transaction in approprate place in fullModelTrans
		if( transaction.transactionType == 'Model' ){
			fullModelTrans['ModelTransaction'] = transaction.id; 
		} else {
			fullModelTrans['VisualModelTransaction'] = transaction.id;			
		}
		
		//Process transaction locally
		try{
			processTransactionsHelper( name, transaction );	
		}catch(err){
			throwError( 'transaction.js', 'processTransactionsHelper', err.message, false );
			criticalError();
			return;
		}
		
		//Process transaction in the cloud
		try{
			processTransactionsCloudHelper( name, transaction );
		}catch(err){
			throwError( 'transaction.js', 'processTransactionsHelper', err.message, false );
			criticalError();
		}
	}
	
	/*	Store the fullModelTrans in the cloud, the cloud will send it
	 * 	back for local storage
	 */
	try{
		storeFullModelTrans( fullModelTrans );
	}catch(err){
		throwError( 'transaction.js', 'storeFullModelTrans', err.message, false );
		criticalError();
	}
}

/*	processTransactionsHelper: helper function that processes 1 transaction
 * 	at at time. See processTransactions for more information on exsactly
 * 	what is done.
 *
 * 	Params: 
 * 	_name: the name of the transaction, should be a UUID
 * 	_transaction: a single transaction as created by createTransaction  
 */
function processTransactionsHelper( _name, _transaction ){
	// extracts actions from the passed transaction
	var actions = _transaction.Actions;
	
	// loop through every action in the passed transaction
	var action = {};
	var actionID = ""
	for( actionID in actions ){
		action = actions[actionID];
		
		//Get the reverse action from the object log
		var reverseAction = getReverseAction( action, _transaction.transactionType );
		//Store returned reverseAction
		action.reverseAction = reverseAction; 
	}
	
	//Get path to the transaction container
	var transactions = {}
	var transactionsPath = "" 
	if( _transaction.transactionType == 'Model' ){
		transactions = model.Model.Model.TransactionLog.Transactions;
	} else {
		transactions = model.VisualModel.TransactionLog.Transactions;
	}
	
	//Store the transaction
	transactions[_name] = _transaction;
	
	//loop over actions in the transaction
	for( actionID in actions ){
		action = actions[actionID];
		
		//Add this new action to the action log
		updateObjectLog( action, _transaction.transactionType );
	}
	
	//Loop over actions
	for( actionID in actions ){		
		action = actions[actionID];
		
		//Load up local storage container for the action's value
		var localObject = getObjPointer( model, action.objectID );
		
		//Validate Action
		if( action.value == null && action.commandType != 'delete' )
			throwError( 'transaction.js', 'processTransactionsHelper', 'value is null and command type is not delete' );
		if( action.value == undefined ) 
			throwError( 'transaction.js', 'processTransactionsHelper', 'value undefined' );
		
		//Set version for the action.	
		if( localObject == undefined || localObject.version == undefined ){
			action.value['version'] = 0;
		} else {
			action.value['version'] =  ( localObject.version + 1 ); 
		}
		
		//Perfomr the action
		executeActions( action );
	}
}

/*	getReverseAction: extracts the last action performed from the object log
 * 	for each action. The last action performed is extracted from the object log
 * 	because value in the local model may have already changed (this is particularly)
 * 	true in the VisualModel. If a insert action is being performed also create a stub
 * 	in the objectLog table.
 * 
 * 	returns: the last action performed on this object, if insert a delete action will be
 * 	returned 
 * 
 * 	Params:
 * 	_action: the action for which to extract the last action performed
 * 	_transactionType: if this is a Model or VisualModel action
 */
function getReverseAction( _action, _transactionType ){
	if( _action == undefined || _transactionType == undefined || ( _transactionType != 'Model' && _transactionType != 'VisualModel' )
		throwError( 'transaction.js', 'getReverseAction', 'Parameters are not valid' );
	
	//Get correct objectLog
	if( _transactionType == 'Model' ){
		var objectLogRoot = model.Model.Model.TransactionLog.ObjectLogs;
	} else if( _transactionType == 'VisualModel' )  {
		var objectLogRoot = model.VisualModel.TransactionLog.ObjectLogs;
	} else {
		throwError( 'transaction.js', 'getReverseAction', 'Transaction Type not valid' );
	}
	
	var objectLog = objectLogRoot[ _action.objectID ];
	
	if( objectLog != undefined ){
		//Get get current action from the head
		var headPair = getObjPointer( model, objectLog.head );
		var lastAction = getObjPointer( model, headPair.currentAction );
		
		//Get previous Action
		/*	If insert and previous action was delete then store a delete command as the reverse.
		 * 	this is nessisary because objectLogs are never deleted so its possible to find an objectLog
		 * 	for something you are inserting due to a undo command.
		 */
		if( _action.commandType == 'insert' ){
			if( lastAction.commandType == 'delete' ){
				return  {
					"changeUI" : _action.changeUI,
					"changeRemote" : _action.changeRemote,
					"commandType" : "delete",
					"value" : null	
				}	
			} else {
				throwError(  'transaction.js', 'getReverseAction', 'new action is insert and previous is not delete or not found' ];
			}
		//If update and last action was not delete extract the last action
		} else if ( _action.commandType == 'update' ){
			if( lastAction.commandType == 'insert' || lastAction.commandType == 'update' ){
				return  {
					"changeUI" : _action.changeUI,
					"changeRemote" : _action.changeRemote,
					"commandType" : "update",
					"value" : lastAction.value
				}
			} else {
				throwError( 'transaction.js', 'getReverseAction', 'new action is update and previous is delete' );
			}
		//If delete and last action was not delete extract the last action
		} else if ( _action.commandType == 'delete' ){
			if( lastAction.commandType == 'insert' || lastAction.commandType == 'update' ){
				return  {
					"changeUI" : _action.changeUI,
					"changeRemote" : _action.changeRemote,
					"commandType" : "insert",
					"value" : lastAction.value
				}
			} else {
				throwError( 'transaction.js', 'getReverseAction', 'new action is delete and previous is delete' );
			}
		}
		//If somehow you got to the end of the above without returning something or throwing an error, throw an error.
		throwError( 'transaction.js', 'getReverseAction', 'bad data passed in action' );
	} else {
		/*	IF the objectLog did not already exists, and the commandType is insert, create a stub
		 * 	and return a new delete action
		 */
		if( _action.commandType == "insert" ){
			if( _transactionType == 'Model' ){
				var id = "#/Model/Model/TransactionLog/ObjectLogs/" + _action.objectID;
				var pairID = id + "/" + uuid.v4();
			} else {
				var id = "#/VisualModel/TransactionLog/ObjectLogs/" + _action.objectID;
				var pairID = id + "/" + uuid.v4();
			}
			
			objectLogRoot[_action.objectID] = {
				"id" : id,
				"objectID" : _action.objectID,
				"head" : null,
				"ActionPairs": { "empty": "" }
			}
			
			return {
				"changeUI" : _action.changeUI,
				"changeRemote" : _action.changeRemote,
				"commandType" : "delete",
				"value" : null	
			}
		}
		
		throwError( 'transaction.js', 'getReverseAction', 'objectID not found in object log and new action is not insert' );
	}
}


function updateObjectLog( _action, _transactionType ){
	//Get correct objectLog
	if( _transactionType == 'Model' ){
		var objectLogRoot = model.Model.Model.TransactionLog.ObjectLogs;
	} else {
		var objectLogRoot = model.VisualModel.TransactionLog.ObjectLogs;
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
		throwError( 'transaction.js', 'updateObjectLog', 'objectID not found' );
	}
	
	var actionPairID = uuid.v4()
	
	var actionPair = {
		"currentAction" : _action.id,
		"PreviousPair" : objectLog.head 
	}
	
	objectLog.ActionPairs[actionPairID] = actionPair;
	objectLog.head = objectLog.id + '/ActionPairs/' + actionPairID;
}

function executeActions( _action ){
	switch( _action.commandType ){
		case 'insert':
			var container = getObjPointerParent( model, _action.objectID );
			var id = getPointerUUID( _action.objectID );

			if( id != undefined )
				container[id] = _action.value;
			break;
		case 'update':
			var container = getObjPointerParent( model, _action.objectID );
			var id = getPointerUUID( _action.objectID );			
			
			if( id != undefined )
				container[id] = _action.value;
			break;
		case 'delete':
			var container = getObjPointerParent( model, _action.objectID );
			var id = getPointerUUID( _action.objectID );			
			
			if( id != undefined )
				delete container[id];
			break;
	}
}
