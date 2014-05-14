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


var http = require('http');
var fs = require('fs');
var port = process.env.PORT || 1337;

function serveStaticFile(res, path, contentType, responseCode) {
	if(!responseCode) responseCode = 200;
	fs.readFile(__dirname + path, function(err,data) {
		if (err) {
			res.writeHead(500, {'Content-Type': 'text/html'});
			res.end('500 - Internal Error');
		} else {
			res.writeHead(responseCode, {'Content-Type': contentType });
			res.end(data);
		}
	});
}

http.createServer(function(req,res) {
	var path = req.url.replace(/\/?(?:\?.*)?$/, '').toLowerCase();

	switch (path) {
		case '':
			serveStaticFile(res, '/public/index.html', 'text/html');
			break;
		case '/about':
			serveStaticFile(res, '/public/about.html', 'text/html');
			break;
		default:
			serveStaticFile(res, '/public/notfound.html', 'text/html', 404);
			break;
	}
}).listen(port);

console.log("Server running at port " + port);