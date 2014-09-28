function localTransTest(){
	//Add an Entity
	var newModelID = uuid.v4();
	
	var aAction = cloneJSON( master.ormObj.entityTemplate );
	
	aAction.objectID = "#/Model/Model/ModelObjects/" + newModelID;
	aAction.value.id = "#/Model/Model/ModelObjects/" + newModelID;
	
	var aVisualAction = master.canvas.ormObj.addObj( 'entity', newModelID, 10, 10 );
	
	var actions = [ aAction ];
	var visualActions = [ aVisualAction ];
	
	var trans = master.transaction.createTransaction( "Model", actions );	
	var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
	master.transaction.processTransactions( trans );
	
	//Add a Value
	newModelID = uuid.v4();
	
	aAction = cloneJSON( master.ormObj.entityTemplate );
	
	aAction.objectID = "#/Model/Model/ModelObjects/" + newModelID;
	aAction.value.id = "#/Model/Model/ModelObjects/" + newModelID;
	
	aVisualAction = master.canvas.ormObj.addObj( 'entity', newModelID, 100, 10 );
	
	actions = [ aAction ];
	visualActions = [ aVisualAction ];
	
	trans = master.transaction.createTransaction( "Model", actions );	
	trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
	master.transaction.processTransactions( trans );
	
	//Give the value a name
	master.ormObj.editName( "#/Model/Model/ModelObjects/" + newModelID, 'Name' );

	//Start remote server
	$('#transaction_remote').html('<iframe src="transaction.test.remote.html?fbRef=' + fbRef + '"></iframe>');
	
	mocha.run();
}