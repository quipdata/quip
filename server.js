var http = require('http')
var port = process.env.PORT || 1337;
http.createServer(function(req,res) {
   res.writeHead(200, {'Content-Type':'http'});
   res.end('Hello world');
}).listen(port);
