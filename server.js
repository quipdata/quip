var mysql = require('mysql');
var connection = mysql.createConnection({
	host: 'us-cdbr-azure-west-a.cloudapp.net',
	user: 'bee741e5969e8c',
	password: '8a2a5909'
});
connection.connect(function (err) {
	if (err) {
		console.error('error connecting: ' + err.stack);
		return;
	}

	console.log('connected as id ' + connection.threadId);
});

var sqlResponse;

connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
   if (err) throw err;

   sqlResponse = rows[0].solution;
});

connection.end();


var http = require('http')
var port = process.env.PORT || 1337;

http.createServer(function(req,res) {
	var path = req.url.replace(/\/?(?:\?.*)?$/, '').toLowerCase();

	switch (path) {
		case '':
			res.writeHead(200,{'Content-Type':'text/html'});
			res.end('Homepage. SQL response was: ' + sqlResponse);
			break;
		case '/about':
			res.writeHead(200,{'Content-Type':'text/html'});
			res.end('About');
			break;
		default:
			res.writeHead(404,{'Content-Type':'text/html'});
			res.end('Not found');
	}
}).listen(port);

console.log("Server running at port " + port);