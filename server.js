// server.js

// basic setup
var express = require('express');
var http = require('http');
var app = express();
var port = process.env.PORT || 1337;


app.set('port', port );

var router = express.Router();

router.get('/', function(req,res) {
	res.send('Hello, World');
});

router.get('/about', function(req,res) {
	res.send('About Quipdata');
});

router.use(function(req,res,next){
	res.status(404);
	res.send('404-Not Found');
});

app.use('/', router);

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express started at ' + app.get('port') + '; press Ctrl-C to terminate.');
});