// server.js

// basic setup
var express = require('express');
var http = require('http');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 1337;
// imports from my modules
var fortune = require('./lib/fortune.js');

// handlebars is our current view engine, and res.render calls will be routed
// to the handlebars engine
var handlebars = require('express3-handlebars').create({defaultLayout:'main'});
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');


app.set('port', port );

// The default router; handles non-secure transactions
var router = express.Router();

router.get('/', function(req,res) {
	res.render('home');
});

router.get('/login', function(req,res) {
	res.render('login');
});

// Here we see an example of templating in action - we swap our getFortune for
// the appropriate handlebar code in about.handlebars, go check that out
// also note that the fortune.getFortune is in an external user module in /lib
router.get('/about', function(req,res) {
	res.render('about', {
		fortune: fortune.getFortune(),
		pageTestScript: '/qa/tests-about.js'
	});
});

// A way to see the headers data that is sent by the browser to the server
router.get('/headers', function(req,res) {
	var s = '';
	for (var name in req.headers) s += name + ": " + req.headers[name] + '<p>';
		res.send(s);
});

router.post('/process', function(req,res) {
	if(req.xhr || req.accepts('json')==='json') {
		res.send({success: true});
	} else {
		res.send('Failure');
	}
});

router.use(function(req,res,next){
	res.status(404);
	res.render('404');
});

// this is needed to get POST and GET results!
app.use(bodyParser());

// This activates our test scripts when ?test=1 is at the end of the base url
app.use(function(req, res, next) {
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
	next();
});
app.use(express.static(__dirname + '/public'));
app.use('/', router);

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express started at ' + app.get('port') + '; press Ctrl-C to terminate.');
});