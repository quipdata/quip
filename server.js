var express = require('express');
var http = require('http');

var app = express();

var port = process.env.PORT || 1337;

app.set('port', port );

app.get('/', function(req,res) {
	res.type('text/html');
	res.send('Hello, World');
});

app.get('/about', function(req,res) {
	res.type('text/html');
	res.send('About Quipdata');
});

app.use(function(req,res,next){
	res.type('text/html');
	res.status(404);
	res.send('404-Not Found');
});

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express started at ' + app.get('port') + '; press Ctrl-C to terminate.');
});