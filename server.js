// server.js

// basic setup
var express = require('express');
var http = require('http');
var app = express();
var port = process.env.PORT || 1337;

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

// Here we see an example of templating in action - we swap our randomFortune for
// the appropriate handlebar code in about.handlebars, go check that out
router.get('/about', function(req,res) {
	var randomFortune = fortuneCookies[Math.floor(Math.random() * fortuneCookies.length)];
	res.render('about', {fortune:randomFortune});
});

router.use(function(req,res,next){
	res.status(404);
	res.render('404');
});

app.use(express.static(__dirname + '/public'));
app.use('/', router);

var fortuneCookies = [
	'be as water',
	'reality is an illusion',
	'when your mind speaks, be the one that hears',
	'you are not your thoughts or feelings',
	'die the death before death'
];

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express started at ' + app.get('port') + '; press Ctrl-C to terminate.');
});