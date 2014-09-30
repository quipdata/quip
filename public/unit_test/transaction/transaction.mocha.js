describe('transaction.js', function(){

	before(function(done){
	    	this.timeout( 1 * 60 * 1000 );//1 minute

			modelLoaded( 0 );
			onModelLoadedComplete = function(){
				done();
			}		
	})

	describe('createTransaction()', function(){
		it('Can create a single transaction', function(){
			var actions = [
				{	"objectID" : "#/Model/Model/ModelObjects/e4644cb4-1624-4c46-966f-961595f64d17",
					"commandType" : "insert",
					"value" : {
					    "id": "#/Model/Model/ModelObjects/e4644cb4-1624-4c46-966f-961595f64d17",
					    "name": "",
					    "type": "Object",
					    "notes": "",
					    "ModelRelationshipConnectors": { "empty":"" }
					}
				}
			]
			
			var trans = master.transaction.createTransaction( "Model", actions );
			
			var test = {"6c6f6d96-0a67-4ecd-a077-a7581702864a":{"id":"#/Model/Model/TransactionLog/Transactions/6c6f6d96-0a67-4ecd-a077-a7581702864a","transactionType":"Model","modifiedBy":"e4644cb4-1624-4c46-966f-961595f64d17","modifiedOn":"2014-08-12T03:29:25.396Z","Actions":{"bb4bb8aa-ee1b-4cc9-be51-49bf8c01cb27":{"id":"#/Model/Model/TransactionLog/Transactions/6c6f6d96-0a67-4ecd-a077-a7581702864a/Actions/bb4bb8aa-ee1b-4cc9-be51-49bf8c01cb27","objectID":"#/Model/Model/ModelObjects/e4644cb4-1624-4c46-966f-961595f64d17","changeUI":false,"changeRemote":true,"commandType":"insert","value":{"id":"#/Model/Model/ModelObjects/e4644cb4-1624-4c46-966f-961595f64d17","name":"","type":"Object","notes":"","ModelRelationshipConnectors":{"empty":""}}}}}};
			
			expect(JSONEqual( trans, test )).to.be.true;
	   });
	   
	   it('Can create two transactions', function(){
			var actions = [
				{	"objectID" : "#/Model/Model/ModelObjects/e4644cb4-1624-4c46-966f-961595f64d17",
					"commandType" : "insert",
					"value" : {
					    "id": "#/Model/Model/ModelObjects/e4644cb4-1624-4c46-966f-961595f64d17",
					    "name": "",
					    "type": "Object",
					    "notes": "",
					    "ModelRelationshipConnectors": { "empty":"" }
					}
				}
			]
			
			var trans = master.transaction.createTransaction( "Model", actions );
			
			var visualActions = [
				{	"objectID" : "#/VisualModel/groups/98ec0430-2956-4b14-9590-10b74ca9ed1d",
					"commandType" : "insert",
					"value" : {
					    "type": "Object",
					    "id": "#/VisualModel/groups/98ec0430-2956-4b14-9590-10b74ca9ed1d",
					    "modelID": "#/Model/Model/ModelObjects/dc8c3706-b25c-4682-8cb6-9866de4f626d",
					    "selectedBy": "default",
					    "attr": {
							x: 100,
							y: 100,
							draggable: true
						},
					    "function": {},
					    "objects": {}
					}
				}
			]
			
			visualActions[0]['value']['objects']["956bec1a-12c6-4c57-ae58-f2dee6443574"] = {
			    "id": "#/VisualModel/groups/98ec0430-2956-4b14-9590-10b74ca9ed1d/objects/956bec1a-12c6-4c57-ae58-f2dee6443574",
			    "modelID": "#/Model/Model/ModelObjects/dc8c3706-b25c-4682-8cb6-9866de4f626d",
			    "class": "Rect",
			    "attr": {
					width: 40,
					height: 40,
					stroke: 'black',
					strokeWidth: 1,
					cornerRadius: 8,
					fill: 'white',
					name: 'content'
				},
			    "function": {},
			    "links": {"empty":""}
			}
			
			trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
			var test = {"608791f5-d0a3-418c-ab3d-ce5cc09ae34e":{"id":"#/Model/Model/TransactionLog/Transactions/608791f5-d0a3-418c-ab3d-ce5cc09ae34e","transactionType":"Model","modifiedBy":"e4644cb4-1624-4c46-966f-961595f64d17","modifiedOn":"2014-08-12T04:56:29.363Z","Actions":{"de32c0ed-d648-4f39-afb5-2bf823b5b9c2":{"id":"#/Model/Model/TransactionLog/Transactions/608791f5-d0a3-418c-ab3d-ce5cc09ae34e/Actions/de32c0ed-d648-4f39-afb5-2bf823b5b9c2","objectID":"#/Model/Model/ModelObjects/e4644cb4-1624-4c46-966f-961595f64d17","changeUI":false,"changeRemote":true,"commandType":"insert","value":{"id":"#/Model/Model/ModelObjects/e4644cb4-1624-4c46-966f-961595f64d17","name":"","type":"Object","notes":"","ModelRelationshipConnectors":{"empty":""}}}}},"a0fb4add-ab09-4e07-91fa-788a7f16ec47":{"id":"#/VisualModel/TransactionLog/Transactions/a0fb4add-ab09-4e07-91fa-788a7f16ec47","transactionType":"VisualModel","modifiedBy":"e4644cb4-1624-4c46-966f-961595f64d17","modifiedOn":"2014-08-12T04:56:29.364Z","Actions":{"12276bd4-424c-42cc-8327-73ee32432b0a":{"id":"#/VisualModel/TransactionLog/Transactions/a0fb4add-ab09-4e07-91fa-788a7f16ec47/Actions/12276bd4-424c-42cc-8327-73ee32432b0a","objectID":"#/VisualModel/groups/98ec0430-2956-4b14-9590-10b74ca9ed1d","changeUI":true,"changeRemote":true,"commandType":"insert","value":{"type":"Object","id":"#/VisualModel/groups/98ec0430-2956-4b14-9590-10b74ca9ed1d","modelID":"#/Model/Model/ModelObjects/dc8c3706-b25c-4682-8cb6-9866de4f626d","selectedBy":"default","attr":{"x":100,"y":100,"draggable":true},"function":{},"objects":{"956bec1a-12c6-4c57-ae58-f2dee6443574":{"id":"#/VisualModel/groups/98ec0430-2956-4b14-9590-10b74ca9ed1d/objects/956bec1a-12c6-4c57-ae58-f2dee6443574","modelID":"#/Model/Model/ModelObjects/dc8c3706-b25c-4682-8cb6-9866de4f626d","class":"Rect","attr":{"width":40,"height":40,"stroke":"black","strokeWidth":1,"cornerRadius":8,"fill":"white","name":"content"},"function":{},"links":{"empty":""}}}}}}}};
			
			expect(JSONEqual( trans, test )).to.be.true;
	   });
	    
	    it('fail if no prameters passed', function(){
	    	try{
	    		master.transaction.createTransaction();
	    		throw new Error( 'Function did not fail' );
	    	}catch( err ){
	    		expect( err.message ).to.equals( '_transactionType not provided or not a valid value' )	
	    	}
	    })
	    
	    it('fail if only _transactionType is passed', function(){
	    	try{
	    		master.transaction.createTransaction( 'VisualModel' );
	    		throw new Error( 'Function did not fail' );
	    	}catch( err ){
	    		expect( err.message ).to.equals( '_actionParams not provided' )	
	    	}
	    })
	    
	    it('insert update and delete all work locally and remotely', function(){
			var testModel = {"Model":{"Model":{"ModelObjects":{"empty":"","0adc23e0-25af-44e6-b396-7ac8a63e192f":{"id":"#/Model/Model/ModelObjects/0adc23e0-25af-44e6-b396-7ac8a63e192f","name":"","type":"Entity","notes":"","ModelRelationshipConnectors":{"empty":""},"version":0}},"ModelRelationships":{"empty":""},"ModelRules":{"empty":""},"TransactionLog":{"ObjectLogs":{"empty":"","0adc23e0-25af-44e6-b396-7ac8a63e192f":{"ActionPairs":{"c2149bac-0ab8-4215-9ee2-3a105b3e9140":{"currentAction":"#/Model/Model/TransactionLog/Transactions/a9b4a260-888c-4e0f-9327-b2b84bf5ff43/Actions/48609e1b-0567-46e4-9154-dee8b4b05b18"},"empty":""},"head":"#/Model/Model/TransactionLog/ObjectLogs/0adc23e0-25af-44e6-b396-7ac8a63e192f/ActionPairs/c2149bac-0ab8-4215-9ee2-3a105b3e9140","id":"#/Model/Model/TransactionLog/ObjectLogs/0adc23e0-25af-44e6-b396-7ac8a63e192f","objectID":"#/Model/Model/ModelObjects/0adc23e0-25af-44e6-b396-7ac8a63e192f"},"da7803c9-8156-43f0-b329-36a145b84896":{"ActionPairs":{"2eeba387-e1b6-48ad-acdf-248656f5751c":{"PreviousPair":"#/Model/Model/TransactionLog/ObjectLogs/da7803c9-8156-43f0-b329-36a145b84896/ActionPairs/c6098518-ab43-4123-ad75-82afd70c8758","currentAction":"#/Model/Model/TransactionLog/Transactions/609687ae-079d-4f3c-b467-1e411761547b/Actions/6a628cac-04d1-4d61-84d8-89d42d5dd0d4"},"c6098518-ab43-4123-ad75-82afd70c8758":{"PreviousPair":"#/Model/Model/TransactionLog/ObjectLogs/da7803c9-8156-43f0-b329-36a145b84896/ActionPairs/f8ce0c1a-c146-43c9-827b-e9c839027520","currentAction":"#/Model/Model/TransactionLog/Transactions/839f8946-5e1c-4c48-a0fb-1ac5566423e8/Actions/64c5ea04-664e-401c-976a-9b751f9746ce"},"empty":"","f8ce0c1a-c146-43c9-827b-e9c839027520":{"currentAction":"#/Model/Model/TransactionLog/Transactions/d64f3671-9c61-4858-8dbb-1d6f4d806cc3/Actions/b034dee5-4379-4066-a443-69620c09126a"}},"head":"#/Model/Model/TransactionLog/ObjectLogs/da7803c9-8156-43f0-b329-36a145b84896/ActionPairs/2eeba387-e1b6-48ad-acdf-248656f5751c","id":"#/Model/Model/TransactionLog/ObjectLogs/da7803c9-8156-43f0-b329-36a145b84896","objectID":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896"}},"TransactionLog":{"empty":"","-JXy1UARI8KLg1IpJayW":"#/Model/Model/TransactionLog/Transactions/a9b4a260-888c-4e0f-9327-b2b84bf5ff43","-JXy1UAhHjssTIwgG0sk":"#/Model/Model/TransactionLog/Transactions/d64f3671-9c61-4858-8dbb-1d6f4d806cc3","-JXy1UAuki--nhsKTPHl":"#/Model/Model/TransactionLog/Transactions/839f8946-5e1c-4c48-a0fb-1ac5566423e8","-JXy1NGhzyMZHpNhEkFc":"#/Model/Model/TransactionLog/Transactions/609687ae-079d-4f3c-b467-1e411761547b"},"Transactions":{"empty":"","a9b4a260-888c-4e0f-9327-b2b84bf5ff43":{"Actions":{"48609e1b-0567-46e4-9154-dee8b4b05b18":{"changeRemote":true,"changeUI":false,"commandType":"insert","id":"#/Model/Model/TransactionLog/Transactions/a9b4a260-888c-4e0f-9327-b2b84bf5ff43/Actions/48609e1b-0567-46e4-9154-dee8b4b05b18","objectID":"#/Model/Model/ModelObjects/0adc23e0-25af-44e6-b396-7ac8a63e192f","reverseAction":{"changeRemote":true,"changeUI":false,"commandType":"delete"},"value":{"ModelRelationshipConnectors":{"empty":""},"id":"#/Model/Model/ModelObjects/0adc23e0-25af-44e6-b396-7ac8a63e192f","name":"","notes":"","type":"Entity","version":0}}},"id":"#/Model/Model/TransactionLog/Transactions/a9b4a260-888c-4e0f-9327-b2b84bf5ff43","modifiedBy":"2eb6a7cc-c6bf-5018-be3b-c653dc023f38","modifiedOn":"2014-09-28T20:53:16.120Z","transactionType":"Model"},"d64f3671-9c61-4858-8dbb-1d6f4d806cc3":{"Actions":{"b034dee5-4379-4066-a443-69620c09126a":{"changeRemote":true,"changeUI":false,"commandType":"insert","id":"#/Model/Model/TransactionLog/Transactions/d64f3671-9c61-4858-8dbb-1d6f4d806cc3/Actions/b034dee5-4379-4066-a443-69620c09126a","objectID":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896","reverseAction":{"changeRemote":true,"changeUI":false,"commandType":"delete"},"value":{"ModelRelationshipConnectors":{"empty":""},"id":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896","name":"","notes":"","type":"Entity","version":0}}},"id":"#/Model/Model/TransactionLog/Transactions/d64f3671-9c61-4858-8dbb-1d6f4d806cc3","modifiedBy":"2eb6a7cc-c6bf-5018-be3b-c653dc023f38","modifiedOn":"2014-09-28T20:53:16.140Z","transactionType":"Model"},"839f8946-5e1c-4c48-a0fb-1ac5566423e8":{"Actions":{"64c5ea04-664e-401c-976a-9b751f9746ce":{"changeRemote":true,"changeUI":false,"commandType":"update","id":"#/Model/Model/TransactionLog/Transactions/839f8946-5e1c-4c48-a0fb-1ac5566423e8/Actions/64c5ea04-664e-401c-976a-9b751f9746ce","objectID":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896","reverseAction":{"changeRemote":true,"changeUI":false,"commandType":"update","value":{"ModelRelationshipConnectors":{"empty":""},"id":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896","name":"","notes":"","type":"Entity","version":0}},"value":{"ModelRelationshipConnectors":{"empty":""},"id":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896","name":"Name","notes":"","type":"Entity","version":1}}},"id":"#/Model/Model/TransactionLog/Transactions/839f8946-5e1c-4c48-a0fb-1ac5566423e8","modifiedBy":"2eb6a7cc-c6bf-5018-be3b-c653dc023f38","modifiedOn":"2014-09-28T20:53:16.151Z","transactionType":"Model"},"609687ae-079d-4f3c-b467-1e411761547b":{"Actions":{"6a628cac-04d1-4d61-84d8-89d42d5dd0d4":{"changeRemote":true,"changeUI":false,"commandType":"delete","id":"#/Model/Model/TransactionLog/Transactions/609687ae-079d-4f3c-b467-1e411761547b/Actions/6a628cac-04d1-4d61-84d8-89d42d5dd0d4","objectID":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896","reverseAction":{"changeRemote":true,"changeUI":false,"commandType":"insert","value":{"ModelRelationshipConnectors":{"empty":""},"id":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896","name":"Name","notes":"","type":"Entity","version":1}}}},"id":"#/Model/Model/TransactionLog/Transactions/609687ae-079d-4f3c-b467-1e411761547b","modifiedBy":"2eb6a7cc-c6bf-5018-be3b-c653dc023f38","modifiedOn":"2014-09-28T20:53:17.682Z","transactionType":"Model"}}},"metadata":{"createdOn":"","creator":"","editors":"","id":"","modifiedDate":"","name":"","type":""}},"ModelRefs":{"empty":""}},"TransactionLog":{"empty":"","-JXy1UAfN3T3jgMdN22j":{"ModelTransaction":"#/Model/Model/TransactionLog/Transactions/a9b4a260-888c-4e0f-9327-b2b84bf5ff43","VisualModelTransaction":"#/VisualModel/TransactionLog/Transactions/e6a4317a-d491-49fb-beae-44d737b40692"},"-JXy1UAqPOalTa4TPUeh":{"ModelTransaction":"#/Model/Model/TransactionLog/Transactions/d64f3671-9c61-4858-8dbb-1d6f4d806cc3","VisualModelTransaction":"#/VisualModel/TransactionLog/Transactions/db77fcd0-6326-41c2-9b06-6ffeddcb8177"},"-JXy1UB63JpI-yHkdWxu":{"ModelTransaction":"#/Model/Model/TransactionLog/Transactions/839f8946-5e1c-4c48-a0fb-1ac5566423e8","VisualModelTransaction":"#/VisualModel/TransactionLog/Transactions/6d77dd38-5376-4411-9458-011b4d123594"},"-JXy1NGqoiNaD0ebn-V1":{"ModelTransaction":"#/Model/Model/TransactionLog/Transactions/609687ae-079d-4f3c-b467-1e411761547b","VisualModelTransaction":"#/VisualModel/TransactionLog/Transactions/e430177d-418e-4d27-9fa3-a05daaa5835f"}},"VisualModel":{"TransactionLog":{"ObjectLogs":{"empty":"","1e4ac6dd-1616-4514-ad42-55dbb0082d90":{"ActionPairs":{"cff35c87-7657-4af4-9957-ef596ca343b5":{"currentAction":"#/VisualModel/TransactionLog/Transactions/e6a4317a-d491-49fb-beae-44d737b40692/Actions/9aae8638-45a9-45ae-9198-6d4e4729c48f"},"empty":""},"head":"#/VisualModel/TransactionLog/ObjectLogs/1e4ac6dd-1616-4514-ad42-55dbb0082d90/ActionPairs/cff35c87-7657-4af4-9957-ef596ca343b5","id":"#/VisualModel/TransactionLog/ObjectLogs/1e4ac6dd-1616-4514-ad42-55dbb0082d90","objectID":"#/VisualModel/groups/1e4ac6dd-1616-4514-ad42-55dbb0082d90"},"ae7130e0-c268-40f0-a4cd-7c1c220cc898":{"ActionPairs":{"07049f2f-101e-4cda-9803-b3337584b06b":{"currentAction":"#/VisualModel/TransactionLog/Transactions/db77fcd0-6326-41c2-9b06-6ffeddcb8177/Actions/e59717be-ad29-41ba-ae17-eb9a9eac6343"},"4bb7cf2f-22f6-4b0e-8c17-b3b4f540aa77":{"PreviousPair":"#/VisualModel/TransactionLog/ObjectLogs/ae7130e0-c268-40f0-a4cd-7c1c220cc898/ActionPairs/7bd9a0c3-65fc-4306-b4d3-f88dfdd26672","currentAction":"#/VisualModel/TransactionLog/Transactions/e430177d-418e-4d27-9fa3-a05daaa5835f/Actions/7cfc23df-7df3-47cd-a03d-5dbda167ff69"},"7bd9a0c3-65fc-4306-b4d3-f88dfdd26672":{"PreviousPair":"#/VisualModel/TransactionLog/ObjectLogs/ae7130e0-c268-40f0-a4cd-7c1c220cc898/ActionPairs/07049f2f-101e-4cda-9803-b3337584b06b","currentAction":"#/VisualModel/TransactionLog/Transactions/6d77dd38-5376-4411-9458-011b4d123594/Actions/11cb6b5b-7815-4344-b26b-55cc1996173d"},"empty":""},"head":"#/VisualModel/TransactionLog/ObjectLogs/ae7130e0-c268-40f0-a4cd-7c1c220cc898/ActionPairs/4bb7cf2f-22f6-4b0e-8c17-b3b4f540aa77","id":"#/VisualModel/TransactionLog/ObjectLogs/ae7130e0-c268-40f0-a4cd-7c1c220cc898","objectID":"#/VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898"}},"TransactionLog":{"empty":"","-JXy1UAc3cem_YWWH6ja":"#/VisualModel/TransactionLog/Transactions/e6a4317a-d491-49fb-beae-44d737b40692","-JXy1UAozpo9hFcEreKF":"#/VisualModel/TransactionLog/Transactions/db77fcd0-6326-41c2-9b06-6ffeddcb8177","-JXy1UB36TZVI-V2yd5J":"#/VisualModel/TransactionLog/Transactions/6d77dd38-5376-4411-9458-011b4d123594","-JXy1NGon7nbOOpdqPju":"#/VisualModel/TransactionLog/Transactions/e430177d-418e-4d27-9fa3-a05daaa5835f"},"Transactions":{"empty":"","e6a4317a-d491-49fb-beae-44d737b40692":{"Actions":{"9aae8638-45a9-45ae-9198-6d4e4729c48f":{"changeRemote":true,"changeUI":true,"commandType":"insert","id":"#/VisualModel/TransactionLog/Transactions/e6a4317a-d491-49fb-beae-44d737b40692/Actions/9aae8638-45a9-45ae-9198-6d4e4729c48f","objectID":"#/VisualModel/groups/1e4ac6dd-1616-4514-ad42-55dbb0082d90","reverseAction":{"changeRemote":true,"changeUI":true,"commandType":"delete"},"value":{"attr":{"draggable":true,"id":"VisualModel/groups/1e4ac6dd-1616-4514-ad42-55dbb0082d90","x":10,"y":10},"functions":{"makeInteractive":{"functionName":"makeInteractive","params":["VisualModel/groups/1e4ac6dd-1616-4514-ad42-55dbb0082d90"]}},"id":"VisualModel/groups/1e4ac6dd-1616-4514-ad42-55dbb0082d90","modelID":"#/Model/Model/ModelObjects/0adc23e0-25af-44e6-b396-7ac8a63e192f","objects":{"feec1bff-e743-4f55-a8ed-8a842ee16b81":{"attr":{"cornerRadius":8,"fill":"white","height":40,"id":"VisualModel/groups/1e4ac6dd-1616-4514-ad42-55dbb0082d90/objects/feec1bff-e743-4f55-a8ed-8a842ee16b81","stroke":"black","strokeWidth":1,"width":40},"class":"Rect","id":"VisualModel/groups/1e4ac6dd-1616-4514-ad42-55dbb0082d90/objects/feec1bff-e743-4f55-a8ed-8a842ee16b81","links":{"empty":""},"modelID":"#/Model/Model/ModelObjects/0adc23e0-25af-44e6-b396-7ac8a63e192f"}},"selectedBy":"default","type":"entity","version":0}}},"id":"#/VisualModel/TransactionLog/Transactions/e6a4317a-d491-49fb-beae-44d737b40692","modifiedBy":"2eb6a7cc-c6bf-5018-be3b-c653dc023f38","modifiedOn":"2014-09-28T20:53:16.120Z","transactionType":"VisualModel"},"db77fcd0-6326-41c2-9b06-6ffeddcb8177":{"Actions":{"e59717be-ad29-41ba-ae17-eb9a9eac6343":{"changeRemote":true,"changeUI":true,"commandType":"insert","id":"#/VisualModel/TransactionLog/Transactions/db77fcd0-6326-41c2-9b06-6ffeddcb8177/Actions/e59717be-ad29-41ba-ae17-eb9a9eac6343","objectID":"#/VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898","reverseAction":{"changeRemote":true,"changeUI":true,"commandType":"delete"},"value":{"attr":{"draggable":true,"id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898","x":100,"y":10},"functions":{"makeInteractive":{"functionName":"makeInteractive","params":["VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898"]}},"id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898","modelID":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896","objects":{"c4da8d3b-1429-40c8-8245-bb2c9a2dc7ef":{"attr":{"cornerRadius":8,"fill":"white","height":40,"id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898/objects/c4da8d3b-1429-40c8-8245-bb2c9a2dc7ef","stroke":"black","strokeWidth":1,"width":40},"class":"Rect","id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898/objects/c4da8d3b-1429-40c8-8245-bb2c9a2dc7ef","links":{"empty":""},"modelID":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896"}},"selectedBy":"default","type":"entity","version":0}}},"id":"#/VisualModel/TransactionLog/Transactions/db77fcd0-6326-41c2-9b06-6ffeddcb8177","modifiedBy":"2eb6a7cc-c6bf-5018-be3b-c653dc023f38","modifiedOn":"2014-09-28T20:53:16.140Z","transactionType":"VisualModel"},"6d77dd38-5376-4411-9458-011b4d123594":{"Actions":{"11cb6b5b-7815-4344-b26b-55cc1996173d":{"changeRemote":true,"changeUI":true,"commandType":"update","id":"#/VisualModel/TransactionLog/Transactions/6d77dd38-5376-4411-9458-011b4d123594/Actions/11cb6b5b-7815-4344-b26b-55cc1996173d","objectID":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898","reverseAction":{"changeRemote":true,"changeUI":true,"commandType":"update","value":{"attr":{"draggable":true,"id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898","x":100,"y":10},"functions":{"makeInteractive":{"functionName":"makeInteractive","params":["VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898"]}},"id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898","modelID":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896","objects":{"c4da8d3b-1429-40c8-8245-bb2c9a2dc7ef":{"attr":{"cornerRadius":8,"fill":"white","height":40,"id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898/objects/c4da8d3b-1429-40c8-8245-bb2c9a2dc7ef","stroke":"black","strokeWidth":1,"width":40},"class":"Rect","id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898/objects/c4da8d3b-1429-40c8-8245-bb2c9a2dc7ef","links":{"empty":""},"modelID":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896"}},"selectedBy":"default","type":"entity","version":0}},"value":{"attr":{"draggable":true,"id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898","selected":false,"x":100,"y":10},"functions":{"makeInteractive":{"functionName":"makeInteractive","params":["VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898"]}},"id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898","modelID":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896","objects":{"c4da8d3b-1429-40c8-8245-bb2c9a2dc7ef":{"attr":{"cornerRadius":8,"fill":"white","height":40,"id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898/objects/c4da8d3b-1429-40c8-8245-bb2c9a2dc7ef","stroke":"black","strokeWidth":1,"width":40},"class":"Rect","id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898/objects/c4da8d3b-1429-40c8-8245-bb2c9a2dc7ef","links":{"empty":""},"modelID":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896"},"d1256ebc-8ba8-420c-81b1-c0fed6489a3a":{"attr":{"fill":"black","fontFamily":"Calibri","fontSize":10,"height":"auto","id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898/objects/d1256ebc-8ba8-420c-81b1-c0fed6489a3a","text":"Name","width":"auto","x":5,"y":15},"class":"Text","id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898/objects/d1256ebc-8ba8-420c-81b1-c0fed6489a3a","links":{"empty":""},"modelID":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896/name"}},"selectedBy":"default","type":"entity","version":1}}},"id":"#/VisualModel/TransactionLog/Transactions/6d77dd38-5376-4411-9458-011b4d123594","modifiedBy":"2eb6a7cc-c6bf-5018-be3b-c653dc023f38","modifiedOn":"2014-09-28T20:53:16.153Z","transactionType":"VisualModel"},"e430177d-418e-4d27-9fa3-a05daaa5835f":{"Actions":{"7cfc23df-7df3-47cd-a03d-5dbda167ff69":{"changeRemote":true,"changeUI":true,"commandType":"delete","id":"#/VisualModel/TransactionLog/Transactions/e430177d-418e-4d27-9fa3-a05daaa5835f/Actions/7cfc23df-7df3-47cd-a03d-5dbda167ff69","objectID":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898","reverseAction":{"changeRemote":true,"changeUI":true,"commandType":"insert","value":{"attr":{"draggable":true,"id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898","selected":false,"x":100,"y":10},"functions":{"makeInteractive":{"functionName":"makeInteractive","params":["VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898"]}},"id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898","modelID":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896","objects":{"c4da8d3b-1429-40c8-8245-bb2c9a2dc7ef":{"attr":{"cornerRadius":8,"fill":"white","height":40,"id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898/objects/c4da8d3b-1429-40c8-8245-bb2c9a2dc7ef","stroke":"black","strokeWidth":1,"width":40},"class":"Rect","id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898/objects/c4da8d3b-1429-40c8-8245-bb2c9a2dc7ef","links":{"empty":""},"modelID":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896"},"d1256ebc-8ba8-420c-81b1-c0fed6489a3a":{"attr":{"fill":"black","fontFamily":"Calibri","fontSize":10,"height":"auto","id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898/objects/d1256ebc-8ba8-420c-81b1-c0fed6489a3a","text":"Name","width":"auto","x":5,"y":15},"class":"Text","id":"VisualModel/groups/ae7130e0-c268-40f0-a4cd-7c1c220cc898/objects/d1256ebc-8ba8-420c-81b1-c0fed6489a3a","links":{"empty":""},"modelID":"#/Model/Model/ModelObjects/da7803c9-8156-43f0-b329-36a145b84896/name"}},"selectedBy":"default","type":"entity","version":1}}}},"id":"#/VisualModel/TransactionLog/Transactions/e430177d-418e-4d27-9fa3-a05daaa5835f","modifiedBy":"2eb6a7cc-c6bf-5018-be3b-c653dc023f38","modifiedOn":"2014-09-28T20:53:17.683Z","transactionType":"VisualModel"}}},"comments":{"empty":""},"groups":{"empty":"","1e4ac6dd-1616-4514-ad42-55dbb0082d90":{"type":"entity","id":"VisualModel/groups/1e4ac6dd-1616-4514-ad42-55dbb0082d90","modelID":"#/Model/Model/ModelObjects/0adc23e0-25af-44e6-b396-7ac8a63e192f","selectedBy":"default","attr":{"x":10,"y":10,"draggable":true,"id":"VisualModel/groups/1e4ac6dd-1616-4514-ad42-55dbb0082d90"},"functions":{"makeInteractive":{"functionName":"makeInteractive","params":["VisualModel/groups/1e4ac6dd-1616-4514-ad42-55dbb0082d90"]}},"objects":{"feec1bff-e743-4f55-a8ed-8a842ee16b81":{"id":"VisualModel/groups/1e4ac6dd-1616-4514-ad42-55dbb0082d90/objects/feec1bff-e743-4f55-a8ed-8a842ee16b81","modelID":"#/Model/Model/ModelObjects/0adc23e0-25af-44e6-b396-7ac8a63e192f","class":"Rect","attr":{"width":40,"height":40,"stroke":"black","strokeWidth":1,"cornerRadius":8,"fill":"white","id":"VisualModel/groups/1e4ac6dd-1616-4514-ad42-55dbb0082d90/objects/feec1bff-e743-4f55-a8ed-8a842ee16b81"},"functions":{},"links":{"empty":""}}},"version":0}},"links":{"empty":""},"metadata":{"id":"","name":"","type":""}},"loaded":true};
	    	
	    	console.log( JSON.stringify( master.model ) );
	    	
			expect(JSONEqual( master.model, testModel )).to.be.true;
	    })
  })
})

function modelLoaded( _i, _callback ){
	if( typeof master.model.loaded == 'boolean' && master.model.loaded ){
		onModelLoadedComplete();
	} else {
		_i++;
		setTimeout( 'modelLoaded( ' + _i + ' )', 500 );
	}
}