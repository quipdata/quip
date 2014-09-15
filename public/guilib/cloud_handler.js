/*	Must implement setListeners in Transaction. Set liseners must open up UI once loaded == true
 */

Transaction.prototype.setListeners = function(){
	
	/*	*** _____________________ *** _____________________ ***
	 * 	Model/Model (LogicalModel) liseners
	 */
	//Model/Model/metadata
	var modelObjects = this.fbModel.child( 'Model/Model/metadata' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.Model.Model.metadata, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.Model.Model.metadata, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.Model.Model.metadata, childSnapshot, false );
	});
	
	//Model/Model/ModelObjects
	var modelObjects = this.fbModel.child( 'Model/Model/ModelObjects' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( master.model.Model.Model.ModelObjects, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( master.model.Model.Model.ModelObjects, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( master.model.Model.Model.ModelObjects, childSnapshot, false );
	});
	
	//Model/Model/ModelObjects
	var modelObjects = this.fbModel.child( 'Model/Model/ModelRelationships' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( master.model.Model.Model.ModelRelationships, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( master.model.Model.Model.ModelRelationships, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( master.model.Model.Model.ModelRelationships, childSnapshot, false );
	});
	
	//Model/Model/ModelRules
	var modelObjects = this.fbModel.child( 'Model/Model/ModelRules' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( master.model.Model.Model.ModelRules, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( master.model.Model.Model.ModelRules, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( master.model.Model.Model.ModelRules, childSnapshot, false );
	});
	
	//Model/Model/TransactionLog/Transactions
	var modelObjects = this.fbModel.child( 'Model/Model/TransactionLog/Transactions' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.Model.Model.TransactionLog.Transactions, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.Model.Model.TransactionLog.Transactions, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.Model.Model.TransactionLog.Transactions, childSnapshot, false );
	});
	
	//Model/Model/TransactionLog/ObjectLogs
	var modelObjects = this.fbModel.child( 'Model/Model/TransactionLog/ObjectLogs' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.Model.Model.TransactionLog.ObjectLogs, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.Model.Model.TransactionLog.ObjectLogs, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.Model.Model.TransactionLog.ObjectLogs, childSnapshot, false );
	});
	
	//Model/Model/TransactionLog/TransactionLog
	var modelObjects = this.fbModel.child( 'Model/Model/TransactionLog/TransactionLog' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.Model.Model.TransactionLog.TransactionLog, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.Model.Model.TransactionLog.TransactionLog, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.Model.Model.TransactionLog.TransactionLog, childSnapshot, false );
	});
	
	//Model/Model/ModelRefs
	var modelObjects = this.fbModel.child( 'Model/Model/ModelRefs' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.Model.Model.ModelRefs, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.Model.Model.ModelRefs, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.Model.Model.ModelRefs, childSnapshot, false );
	});
	
	/*	*** _____________________ *** _____________________ ***
	 * 	VisualModel liseners
	 */
	//VisualModel/metadata
	var modelObjects = this.fbModel.child( 'VisualModel/metadata' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.VisualModel.metadata, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.VisualModel.metadata, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.VisualModel.metadata, childSnapshot, true );
	});	
	 
	//VisualModel/groups
	var modelObjects = this.fbModel.child( 'VisualModel/groups' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( master.model.VisualModel.groups, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( master.model.VisualModel.groups, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( master.model.VisualModel.groups, childSnapshot, true );
	});
	
	//VisualModel/links
	var modelObjects = this.fbModel.child( 'VisualModel/links' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( master.model.VisualModel.links, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( master.model.VisualModel.links, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( master.model.VisualModel.links, childSnapshot, true );
	});
	
	//VisualModel/comments
	var modelObjects = this.fbModel.child( 'VisualModel/comments' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsert( master.model.VisualModel.comments, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdate( master.model.VisualModel.comments, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDelete( master.model.VisualModel.comments, childSnapshot, true );
	});
	
	//VisualModel/TransactionLog/Transactions
	var modelObjects = this.fbModel.child( 'VisualModel/TransactionLog/Transactions' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.VisualModel.TransactionLog.Transactions, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.VisualModel.TransactionLog.Transactions, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.VisualModel.TransactionLog.Transactions, childSnapshot, true );
	});
	
	//VisualModel/TransactionLog/ObjectLogs
	var modelObjects = this.fbModel.child( 'VisualModel/TransactionLog/ObjectLogs' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.VisualModel.TransactionLog.ObjectLogs, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.VisualModel.TransactionLog.ObjectLogs, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.VisualModel.TransactionLog.ObjectLogs, childSnapshot, true );
	});
	
	//VisualModel/TransactionLog/TransactionLog
	var modelObjects = this.fbModel.child( 'VisualModel/TransactionLog/TransactionLog' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.VisualModel.TransactionLog.TransactionLog, childSnapshot, true );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.VisualModel.TransactionLog.TransactionLog, childSnapshot, true );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.VisualModel.TransactionLog.TransactionLog, childSnapshot, true );
	});
	
	/*	*** _____________________ *** _____________________ ***
	 * 	Other liseners
	 */	
	//TransactionLog
	var modelObjects = this.fbModel.child( 'TransactionLog' );
	modelObjects.on( 'child_added', function( childSnapshot ){
		cloudInsertNoVersion( master.model.TransactionLog, childSnapshot, false );
	});
	modelObjects.on( 'child_changed', function( childSnapshot ){
		cloudUpdateNoVersion( master.model.TransactionLog, childSnapshot, false );
	});
	modelObjects.on( 'child_removed', function( childSnapshot ){
		cloudDeleteNoVersion( master.model.TransactionLog, childSnapshot, false );
	});
		
	//loaded
	var modelObjects = this.fbModel.child( 'loaded' );
	modelObjects.on( 'value', function( data ){
		cloudUpdateNoVersion( master.model, data, false );
		if( data.val() == true ){
			//Add startUID
			data.ref().child( 'loaded' );
			modelObjects.off( 'value' );
			
			var uiOpen = function(){
				if( master.canvas == null ){
					setInterval( uiOpen, 500 );
				} else {
					master.canvas.reset( function(){
						closeBlockingAlert();	
					});
				}		
			}
			
			uiOpen();
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
