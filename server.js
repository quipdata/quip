// server.js

// basic setup
var express = require('express');
var http = require('http');
var app = express();
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

// Here we see an example of templating in action - we swap our getFortune for
// the appropriate handlebar code in about.handlebars, go check that out
// also note that the fortune.getFortune is in an external user module in /lib
router.get('/about', function(req,res) {
	res.render('about', { fortune: fortune.getFortune() });
});

router.use(function(req,res,next){
	res.status(404);
	res.render('404');
});

app.use(express.static(__dirname + '/public'));
app.use('/', router);

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express started at ' + app.get('port') + '; press Ctrl-C to terminate.');
});