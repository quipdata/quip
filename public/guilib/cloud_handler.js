function setListeners(){
	
	/*	*** _____________________ *** _____________________ ***
	 * 	Model/Model (LogicalModel) liseners
	 */
	//Model/Model/metadata
	var modelObjects = fbModel.child( 'Model/Model/metadata' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( model.Model.Model.metadata, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( model.Model.Model.metadata, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( model.Model.Model.metadata, childSnapshot, false );
	});
	
	//Model/Model/ModelObjects
	var modelObjects = fbModel.child( 'Model/Model/ModelObjects' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( model.Model.Model.ModelObjects, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( model.Model.Model.ModelObjects, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( model.Model.Model.ModelObjects, childSnapshot, false );
	});
	
	//Model/Model/ModelObjects
	var modelObjects = fbModel.child( 'Model/Model/ModelRelationships' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( model.Model.Model.ModelRelationships, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( model.Model.Model.ModelRelationships, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( model.Model.Model.ModelRelationships, childSnapshot, false );
	});
	
	//Model/Model/ModelRules
	var modelObjects = fbModel.child( 'Model/Model/ModelRules' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( model.Model.Model.ModelRules, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( model.Model.Model.ModelRules, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( model.Model.Model.ModelRules, childSnapshot, false );
	});
	
	//Model/Model/TransactionLog/Transactions
	var modelObjects = fbModel.child( 'Model/Model/TransactionLog/Transactions' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( model.Model.Model.TransactionLog.Transactions, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( model.Model.Model.TransactionLog.Transactions, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( model.Model.Model.TransactionLog.Transactions, childSnapshot, false );
	});
	
	//Model/Model/TransactionLog/ObjectLogs
	var modelObjects = fbModel.child( 'Model/Model/TransactionLog/ObjectLogs' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( model.Model.Model.TransactionLog.ObjectLogs, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( model.Model.Model.TransactionLog.ObjectLogs, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( model.Model.Model.TransactionLog.ObjectLogs, childSnapshot, false );
	});
	
	//Model/Model/TransactionLog/TransactionLog
	var modelObjects = fbModel.child( 'Model/Model/TransactionLog/TransactionLog' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( model.Model.Model.TransactionLog.TransactionLog, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( model.Model.Model.TransactionLog.TransactionLog, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( model.Model.Model.TransactionLog.TransactionLog, childSnapshot, false );
	});
	
	//Model/Model/ModelRefs
	var modelObjects = fbModel.child( 'Model/Model/ModelRefs' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( model.Model.Model.ModelRefs, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( model.Model.Model.ModelRefs, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( model.Model.Model.ModelRefs, childSnapshot, false );
	});
	
	/*	*** _____________________ *** _____________________ ***
	 * 	VisualModel liseners
	 */
	//VisualModel/metadata
	var modelObjects = fbModel.child( 'VisualModel/metadata' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( model.VisualModel.metadata, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( model.VisualModel.metadata, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( model.VisualModel.metadata, childSnapshot, true );
	});	
	 
	//VisualModel/groups
	var modelObjects = fbModel.child( 'VisualModel/groups' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( model.VisualModel.groups, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( model.VisualModel.groups, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( model.VisualModel.groups, childSnapshot, true );
	});
	
	//VisualModel/links
	var modelObjects = fbModel.child( 'VisualModel/links' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( model.VisualModel.links, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( model.VisualModel.links, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( model.VisualModel.links, childSnapshot, true );
	});
	
	//VisualModel/comments
	var modelObjects = fbModel.child( 'VisualModel/comments' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( model.VisualModel.comments, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( model.VisualModel.comments, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( model.VisualModel.comments, childSnapshot, true );
	});
	
	//VisualModel/TransactionLog/Transactions
	var modelObjects = fbModel.child( 'VisualModel/TransactionLog/Transactions' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( model.VisualModel.TransactionLog.Transactions, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( model.VisualModel.TransactionLog.Transactions, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( model.VisualModel.TransactionLog.Transactions, childSnapshot, true );
	});
	
	//VisualModel/TransactionLog/ObjectLogs
	var modelObjects = fbModel.child( 'VisualModel/TransactionLog/ObjectLogs' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( model.VisualModel.TransactionLog.ObjectLogs, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( model.VisualModel.TransactionLog.ObjectLogs, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( model.VisualModel.TransactionLog.ObjectLogs, childSnapshot, true );
	});
	
	//VisualModel/TransactionLog/TransactionLog
	var modelObjects = fbModel.child( 'VisualModel/TransactionLog/TransactionLog' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( model.VisualModel.TransactionLog.TransactionLog, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( model.VisualModel.TransactionLog.TransactionLog, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( model.VisualModel.TransactionLog.TransactionLog, childSnapshot, true );
	});
	
	/*	*** _____________________ *** _____________________ ***
	 * 	Other liseners
	 */	
	//TransactionLog
	var modelObjects = fbModel.child( 'TransactionLog' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( model.TransactionLog, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( model.TransactionLog, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( model.TransactionLog, childSnapshot, false );
	});
		
	//loaded
	var modelObjects = fbModel.child( 'loaded' );
	modelObjects.on( 'value', function( childSnapshot ){
		cloudUpdateNoVersion( model, childSnapshot, false );
		if( childSnapshot.val() == true ){
			//Add startUID
			var modelObjects = fbModel.child( 'loaded' );
			modelObjects.off( 'child_added' );
			modelObjects.off( 'child_changed' );
			modelObjects.off( 'child_removed' );
		}
	});
}

function cloudInsert( _container, _value, _updateUI ){
	if( _value.name() != 'empty' ){
		if( _container[_value.name()] == undefined 
		|| _value.val().version > _container[_value.name()].version ){
			_container[_value.name()] = _value.val();
			
			if( _updateUI ){
				//Update UI	
			}	
		}	
	}
}

function cloudUpdate( _container, _value, _updateUI ){
	if( _value.name() != 'empty' ){
		if( _container[_value.name()] == undefined 
		|| _value.val().version > _container[_value.name()].version ){
			_container[_value.name()] = _value.val();
			
			if( _updateUI ){
				//Update UI	
			}	
		}	
	}
}

function cloudDelete( _container, _value, _updateUI ){
	if( _value.name() != 'empty' ){
		delete _container[_value.name()] ;
	
		if( _updateUI ){
			//Update UI
		}		
	}
}

function cloudInsertNoVersion( _container, _value ){
	if( _value.name() != 'empty' )
		_container[_value.name()] = _value.val();
}

function cloudUpdateNoVersion( _container, _value ){
	if( _value.name() != 'empty' )
		_container[_value.name()] = _value.val();
}

function cloudDeleteNoVersion( _container, _value ){
	if( _value.name() != 'empty' )
		delete _container[_value.name()] ;
}
